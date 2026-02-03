import { db } from "@/app/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { redirect } from "next/navigation"

import { startOfDay, endOfDay, format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon, AlertCircle } from "lucide-react"
import { CalendarWidget } from "./components/CalendarWidget"
import { BookingItem } from "../components/BookingItem"

interface CalendarPageProps {
  searchParams: Promise<{
    date?: string
  }>
}

export default async function CalendarPage({
  searchParams,
}: CalendarPageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return redirect("/")

  const params = await searchParams

  const shop = await db.barberShop.findFirst({
    where: { ownerId: session.user.id },
  })

  if (!shop) return redirect("/dashboard")

  // --- QUERY 1: Datas com Agendamento (Para as bolinhas do calendário) ---
  // Buscamos apenas o campo 'date' para ser leve
  const bookingsDates = await db.booking.findMany({
    where: {
      barberShopId: shop.id,
      date: { gte: new Date() }, // Apenas datas futuras ou hoje
      status: { not: "CANCELLED" }, // Ignora cancelados nas bolinhas
    },
    select: { date: true },
  })

  // Extrai apenas o objeto Date puro
  const bookedDatesList = bookingsDates.map((b) => b.date)

  // --- QUERY 2: Detalhes do Dia Selecionado ---
  const dateParam = params.date
  const selectedDate = dateParam
    ? new Date(`${dateParam}T00:00:00`)
    : new Date()

  const dayBookings = await db.booking.findMany({
    where: {
      barberShopId: shop.id,
      date: {
        gte: startOfDay(selectedDate),
        lte: endOfDay(selectedDate),
      },
    },
    include: {
      service: true,
      user: true,
    },
    orderBy: {
      date: "asc",
    },
  })

  // --- SEPARAÇÃO: CONFIRMADOS vs CANCELADOS ---
  const confirmedBookings = dayBookings.filter((b) => b.status !== "CANCELLED")
  const cancelledBookings = dayBookings.filter((b) => b.status === "CANCELLED")

  return (
    <div className="animate-in fade-in space-y-6 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
        <p className="text-muted-foreground">
          Gerencie seus horários dia a dia.
        </p>
      </div>

      <div className="grid items-start gap-8 md:grid-cols-[300px_1fr]">
        {/* CALENDÁRIO COM BOLINHAS */}
        <div className="md:sticky md:top-8">
          <CalendarWidget bookedDates={bookedDatesList} />
        </div>

        {/* LISTA DE AGENDAMENTOS */}
        <div className="space-y-6">
          <h2 className="flex items-center gap-2 border-b pb-2 text-xl font-bold capitalize">
            <CalendarIcon className="text-primary h-5 w-5" />
            {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </h2>

          {/* ESTADO VAZIO (Só mostra se não tiver NENHUM nem cancelado) */}
          {dayBookings.length === 0 && (
            <div className="bg-muted/20 text-muted-foreground flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-16">
              <CalendarIcon className="mb-3 h-12 w-12 opacity-20" />
              <p className="font-medium">Nenhum agendamento para este dia.</p>
            </div>
          )}

          {/* 1. LISTA DE CONFIRMADOS */}
          {confirmedBookings.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
                  Agendados ({confirmedBookings.length})
                </h3>
              </div>
              {confirmedBookings.map((booking) => (
                <BookingItem
                  key={booking.id}
                  booking={{
                    ...booking,
                    price: Number(booking.price),
                    service: {
                      ...booking.service,
                      price: Number(booking.service.price),
                    },
                  }}
                />
              ))}
            </div>
          )}

          {/* 2. LISTA DE CANCELADOS (SEPARADA E OPACA) */}
          {cancelledBookings.length > 0 && (
            <div className="space-y-3 pt-4 opacity-70 transition-opacity hover:opacity-100">
              <div className="flex items-center gap-2 text-red-500/80">
                <AlertCircle className="h-4 w-4" />
                <h3 className="text-sm font-semibold tracking-wider uppercase">
                  Cancelados ({cancelledBookings.length})
                </h3>
              </div>
              {cancelledBookings.map((booking) => (
                <BookingItem
                  key={booking.id}
                  booking={{
                    ...booking,
                    price: Number(booking.price),
                    service: {
                      ...booking.service,
                      price: Number(booking.service.price),
                    },
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { redirect } from "next/navigation"
import { getCalendarData } from "./actions/get-calendar-data"
import CalendarWidget from "./components/CalendarWidget"
import DayBookingsList from "./components/DayBookingsList"

interface CalendarPageProps {
  searchParams: Promise<{
    date?: string
  }>
}

export default async function CalendarPage({
  searchParams,
}: CalendarPageProps) {
  // 1. AUTH
  const session = await getServerSession(authOptions)
  if (!session) return redirect("/")
  // 2. FETCH DATA
  const params = await searchParams
  const data = await getCalendarData(session.user.id, params.date)
  // Se não achou loja, redireciona
  if (!data) return redirect("/dashboard")

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
          <CalendarWidget bookedDates={data.bookedDatesList} />
        </div>

        {/* LISTA DE AGENDAMENTOS */}
        <DayBookingsList
          selectedDate={data.selectedDate}
          confirmedBookings={data.confirmedBookings}
          cancelledBookings={data.cancelledBookings}
        />
      </div>
    </div>
  )
}

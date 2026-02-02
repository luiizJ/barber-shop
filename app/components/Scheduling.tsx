"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet"
import { Button } from "./ui/button"
import { Calendar } from "./ui/calendar"
import { useEffect, useState } from "react"
import { generateDayTimeList } from "../utils/generate-day-time-list"
import { format, isSameDay, setHours, setMinutes } from "date-fns"
import { Card, CardContent, CardTitle } from "./ui/card"
import { ptBR } from "date-fns/locale"
import { signIn, useSession } from "next-auth/react"
import { toast } from "sonner"
import { getDayBookings } from "../actions/getDayBooking"
import { createBooking } from "../actions/createBooking"
import { useRouter } from "next/navigation"

interface SchedulingProps {
  service: {
    id: string
    barberShopId: string
    name: string
    description: string
    imageUrl: string
    price: number
  }
}

const Scheduling = ({ service }: SchedulingProps) => {
  // 1. HOOKS E ESTADOS (A Memória do Componente)
  const router = useRouter()

  const { data, status } = useSession() // Sessão do usuário (Logado ou não?)

  const [date, setDate] = useState<Date | undefined>(new Date()) // Data selecionada no calendário
  const [hour, setHour] = useState<string | undefined>() // Hora selecionada

  // Controle do Modal (Aberto/Fechado)
  const [sheetIsOpen, setSheetIsOpen] = useState(false)

  // Controle de Loading (Para travar o botão enquanto salva)
  const [submitIsLoading, setSubmitIsLoading] = useState(false)

  interface DayBooking {
    date: Date
  }

  // Estado para armazenar os agendamentos que JÁ EXISTEM no banco
  const [dayBookings, setDayBookings] = useState<DayBooking[]>([])

  // 2. BUSCA DE DADOS (O "Effect" que conversa com o Banco)

  useEffect(() => {
    if (!date) {
      return
    }

    const refreshAvailableHours = async () => {
      const _dayBookings = await getDayBookings({
        barberShopId: service.barberShopId,
        date: date,
      })
      // Guarda a resposta no estado
      setDayBookings(_dayBookings)
    }

    refreshAvailableHours()
  }, [date, service.barberShopId]) // Roda sempre que mudar a DATA ou a LOJA

  // 3. LÓGICA DE FILTRAGEM DE HORÁRIOS

  const handleSelectDate = (date: Date | undefined) => {
    setDate(date)
    setHour(undefined) // Limpa a hora se mudar o dia
  }

  // A: Gera a lista "ideal" (todas as vagas possíveis das 08h às 21h)
  const allDayTimeList = date ? generateDayTimeList(date) : []

  // B: Filtra a lista ideal para mostrar apenas o que é REALMENTE possível
  const timeList = allDayTimeList.filter((time) => {
    // Se não tem data, esconde tudo
    if (!date) {
      return false
    }

    // Converte a string "09:45" para números
    const timeHour = Number(time.split(":")[0])
    const timeMinutes = Number(time.split(":")[1])

    // Cria uma Data Completa com esse horário
    const timeDate = setMinutes(setHours(date, timeHour), timeMinutes)

    // FILTRO 1: Verificar Passado 🕰️
    // Se for hoje E o horário já passou, remove da lista.
    const isPast = isSameDay(date, new Date()) && timeDate < new Date()
    if (isPast) {
      return false
    }
    // FILTRO 2: Verificar Disponibilidade (Banco de Dados) 🛡️
    // Procura se existe algum agendamento no 'dayBookings' com a mesma hora e minuto
    const hasBookingOnCurrentTime = dayBookings.some((booking) => {
      // O Prisma retorna Date
      const bookingDate = new Date(booking.date)
      const bookingHour = bookingDate.getHours()
      const bookingMinutes = bookingDate.getMinutes()

      return bookingHour === timeHour && bookingMinutes === timeMinutes
    })

    // Se já tem agendamento, remove da lista
    if (hasBookingOnCurrentTime) {
      return false
    }
    return true // Se passou por tudo, o horário está LIVRE
  })

  // 4. AÇÃO DE SALVAR (O "Submit")
  const handleBookingSubmit = async () => {
    // Tratativa de Login: Se não logou, manda pro Google
    if (status === "unauthenticated") {
      return signIn("google")
    }
    if (!hour || !date || !data?.user) {
      return
    }
    try {
      setSubmitIsLoading(true)

      const dateHour = Number(hour.split(":")[0])
      const dateMinutes = Number(hour.split(":")[1])
      const newDate = setMinutes(setHours(date, dateHour), dateMinutes)

      // Chama a Server Action
      await createBooking({
        serviceId: service.id,
        date: newDate,
      })

      setSheetIsOpen(false)
      setHour(undefined)
      setDate(new Date())
      toast.success("Reserva realizada com sucesso!", {
        action: {
          label: "Ver Agendamentos",
          onClick: () => {
            router.push("/bookings")
          },
        },
      })
    } catch (error) {
      console.error(error)
      toast.error("Erro ao realizar reserva!")
    } finally {
      setSubmitIsLoading(false)
    }
  }

  // 5. RENDERIZAÇÃO

  return (
    <Sheet open={sheetIsOpen} onOpenChange={setSheetIsOpen}>
      <SheetTrigger asChild>
        <Button size="sm" variant="secondary">
          Agendar
        </Button>
      </SheetTrigger>

      <SheetContent className="overflow-y-auto p-0 [&::-webkit-scrollbar]:hidden">
        <SheetHeader className="border-b border-solid px-5 py-6">
          <SheetTitle>
            <span className="font-bold text-gray-400">{service.name}</span>
          </SheetTitle>
        </SheetHeader>

        {/* CALENDÁRIO */}
        <div className="px-5 py-5">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelectDate}
            className="flex w-full justify-center rounded-md border"
            locale={ptBR}
            fromDate={new Date()}
            styles={{
              head_cell: { width: "100%", textTransform: "capitalize" },
              cell: { width: "100%" },
              button: { width: "100%" },
              nav_button_previous: { width: "32px", height: "32px" },
              nav_button_next: { width: "32px", height: "32px" },
              caption: { textTransform: "capitalize" },
            }}
          />
        </div>

        {/* LISTA DE HORÁRIOS*/}
        {date && (
          <div className="flex flex-col border-t border-solid px-5 pt-6">
            <h3 className="pb-5 text-sm font-bold text-gray-400 uppercase">
              Horários Disponíveis
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
              {timeList.length > 0 ? (
                timeList.map((time) => (
                  <Button
                    key={time}
                    variant={hour === time ? "default" : "outline"}
                    className="min-w-[70px] rounded-full"
                    onClick={() => setHour(time)}
                  >
                    {time}
                  </Button>
                ))
              ) : (
                <p className="text-xs text-gray-400">
                  Não há horários disponíveis para hoje.
                </p>
              )}
            </div>
          </div>
        )}
        {/* RESUMO DO AGENDAMENTO */}
        {date && hour && (
          <div className="flex w-full justify-between border-t border-solid px-5 py-6">
            <Card className="w-full">
              <CardTitle className="mt-4 text-center text-lg font-bold">
                Resumo
              </CardTitle>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold">{service.name}</h4>
                  <p className="font-semibold">
                    {Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(Number(service.price))}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-400">Data</h4>
                  <p className="font-semibold">
                    {format(date, "dd 'de' MMMM", { locale: ptBR })}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-400">Horario</h4>
                  <p className="font-semibold">{hour}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        {/* BOTÃO DE CONFIRMAR */}
        <div className="border-t border-solid px-5 py-5">
          <Button
            className="w-full"
            disabled={
              (!hour || !date || submitIsLoading) && status === "authenticated"
            }
            onClick={handleBookingSubmit}
          >
            {status === "unauthenticated"
              ? "Fazer Login para Agendar"
              : submitIsLoading
                ? "Confirmando..."
                : "Confirmar Agendamento"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default Scheduling

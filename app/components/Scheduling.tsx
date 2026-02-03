"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription, // 👈 Importado para corrigir o erro amarelo
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
import { PaymentMethod } from "@prisma/client"
import PaymentMethods from "./PaymentMethods"
import BookingSuccess from "./BookingSuccess" // 👈 Importado o componente de sucesso

interface SchedulingProps {
  barberShop: {
    id: string
    phones: string[]
    name: string
    slug: string
  }
  service: {
    id: string
    barberShopId: string
    name: string
    description: string
    imageUrl: string
    price: number
  }
}

const Scheduling = ({ service, barberShop }: SchedulingProps) => {
  // 1. HOOKS E ESTADOS
  const { data, status } = useSession()

  // Estado do Método de Pagamento
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.CASH,
  )

  const [date, setDate] = useState<Date | undefined>(new Date())
  const [hour, setHour] = useState<string | undefined>()
  const [sheetIsOpen, setSheetIsOpen] = useState(false)
  const [submitIsLoading, setSubmitIsLoading] = useState(false)

  // Estado para controlar a tela de sucesso
  const [bookingConfirmed, setBookingConfirmed] = useState(false)

  interface DayBooking {
    date: Date
  }

  const [dayBookings, setDayBookings] = useState<DayBooking[]>([])

  // 2. BUSCA DE DADOS
  useEffect(() => {
    if (!date) {
      return
    }

    const refreshAvailableHours = async () => {
      const _dayBookings = await getDayBookings({
        barberShopId: service.barberShopId,
        date: date,
      })
      setDayBookings(_dayBookings)
    }

    refreshAvailableHours()
  }, [date, service.barberShopId])

  // 3. LÓGICA DE FILTRAGEM
  const handleSelectDate = (date: Date | undefined) => {
    setDate(date)
    setHour(undefined)
  }

  const allDayTimeList = date ? generateDayTimeList(date) : []

  const timeList = allDayTimeList.filter((time) => {
    if (!date) {
      return false
    }

    const timeHour = Number(time.split(":")[0])
    const timeMinutes = Number(time.split(":")[1])
    const timeDate = setMinutes(setHours(date, timeHour), timeMinutes)

    const isPast = isSameDay(date, new Date()) && timeDate < new Date()
    if (isPast) {
      return false
    }

    const hasBookingOnCurrentTime = dayBookings.some((booking) => {
      const bookingDate = new Date(booking.date)
      const bookingHour = bookingDate.getHours()
      const bookingMinutes = bookingDate.getMinutes()

      return bookingHour === timeHour && bookingMinutes === timeMinutes
    })

    if (hasBookingOnCurrentTime) {
      return false
    }
    return true
  })

  // 4. AÇÃO DE SALVAR (Agora só salva e troca a tela)
  const handleBookingSubmit = async () => {
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

      // 1. Salva no Banco
      await createBooking({
        serviceId: service.id,
        date: newDate,
        paymentMethod: paymentMethod,
      })

      // 2. Ativa a tela de sucesso (O resto da lógica foi pro BookingSuccess)
      setBookingConfirmed(true)
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
        {/* LÓGICA CONDICIONAL: SUCESSO vs FORMULÁRIO */}
        {bookingConfirmed ? (
          <BookingSuccess
            barberShop={barberShop}
            service={service}
            date={date!}
            hour={hour!}
            paymentMethod={paymentMethod}
            onClose={() => {
              setSheetIsOpen(false)
              setBookingConfirmed(false)
              setDate(new Date())
              setHour(undefined)
            }}
          />
        ) : (
          <>
            <SheetHeader className="border-b border-solid px-5 py-6">
              <SheetTitle>
                <span className="font-bold text-gray-400">{service.name}</span>
              </SheetTitle>
              {/* Adicionado para corrigir o Warning do console */}
              <SheetDescription className="hidden">
                Escolha o horário e a forma de pagamento.
              </SheetDescription>
            </SheetHeader>

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

            {date && hour && (
              <>
                <div className="border-secondary border-t p-5">
                  <PaymentMethods
                    selected={paymentMethod}
                    onChange={setPaymentMethod}
                  />
                </div>

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

                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-gray-400">Pagamento</h4>
                        <p className="font-semibold">
                          {paymentMethod === PaymentMethod.PIX
                            ? "Pix"
                            : paymentMethod === PaymentMethod.CARD
                              ? "Cartão"
                              : "Dinheiro"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            <div className="border-t border-solid px-5 py-5">
              <Button
                className="w-full"
                disabled={
                  (!hour || !date || submitIsLoading) &&
                  status === "authenticated"
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
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default Scheduling

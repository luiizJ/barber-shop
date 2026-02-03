"use client"

import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import {
  CheckCircle2,
  Smartphone,
  CalendarDays,
  CircleDashed,
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { PaymentMethod } from "@prisma/client"
import { useRouter } from "next/navigation"

interface BookingSuccessProps {
  barberShop: {
    name: string
    phones: string[]
  }
  service: {
    name: string
  }
  date: Date
  hour: string
  paymentMethod: PaymentMethod
  onClose: () => void
}

const BookingSuccess = ({
  barberShop,
  service,
  date,
  hour,
  paymentMethod,
  onClose,
}: BookingSuccessProps) => {
  const router = useRouter()

  const isPix = paymentMethod === PaymentMethod.PIX

  const handleGoToWhatsApp = () => {
    const message = `Olá! Acabei de agendar um serviço de *${service.name}* na *${barberShop.name}* para o dia *${format(date, "dd/MM", { locale: ptBR })}* às *${hour}*. Escolhi pagar via *Pix*. Segue o comprovante!`
    const phone = barberShop.phones[0].replace(/\D/g, "")
    const link = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`
    window.open(link, "_blank")
  }

  const handleGoToBookings = () => {
    router.push("/bookings")
    onClose()
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-5 py-10">
      {/* TÍTULO E ÍCONE DINÂMICOS */}
      <div className="flex flex-col items-center gap-2 text-center">
        {/* Se for Pix, usa um ícone pontilhado (ideia de espera), se não, Check verde */}
        {isPix ? (
          <CircleDashed className="text-primary h-16 w-16 animate-pulse" />
        ) : (
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        )}

        <h2 className="text-xl font-bold text-white">
          {isPix ? "Agendamento Solicitado!" : "Agendamento Realizado!"}
        </h2>

        <p className="max-w-[280px] text-center text-sm text-gray-400">
          {isPix
            ? "Para confirmar sua reserva, envie o comprovante de pagamento no WhatsApp."
            : "Sua reserva foi agendada com sucesso. Te esperamos lá!"}
        </p>
      </div>

      {/* CARD DE RESUMO */}
      <Card className="bg-secondary/30 w-full">
        <CardContent className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-3">
            <div className="bg-secondary rounded-full p-2">
              <CalendarDays size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold">{service.name}</p>
              <p className="text-xs text-gray-400">
                {format(date, "dd 'de' MMMM", { locale: ptBR })} às {hour}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* BOTÕES DE AÇÃO */}
      <div className="mt-4 w-full space-y-3">
        {isPix && (
          <Button
            onClick={handleGoToWhatsApp}
            className="w-full"
            variant="default"
          >
            <Smartphone className="mr-2 h-4 w-4" />
            Enviar Comprovante
          </Button>
        )}

        {/* Para quem não é Pix, o botão principal é ver agendamentos */}
        {!isPix && (
          <Button
            onClick={handleGoToBookings}
            className="w-full"
            variant="default"
          >
            Ir para Meus Agendamentos
          </Button>
        )}

        <Button onClick={onClose} variant="outline" className="w-full">
          Fechar
        </Button>
      </div>
    </div>
  )
}

export default BookingSuccess

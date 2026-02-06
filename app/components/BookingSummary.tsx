import { Card, CardContent, CardTitle } from "./ui/card"
import type { BarberServices, BarberShop } from "@prisma/client"
import { PaymentMethod } from "@prisma/client"
import { formatSafe } from "../utils/date-utils"

interface BookingSummaryProps {
  service: Pick<BarberServices, "name" | "price">
  barbershop: Pick<BarberShop, "name">
  selectedDate: Date
  paymentMethod: PaymentMethod
}

const BookingSummary = ({
  service,
  barbershop,
  selectedDate,
  paymentMethod,
}: BookingSummaryProps) => {
  return (
    <Card className="mt-3 mb-6 w-full">
      <CardTitle className="mt-4 text-center text-lg font-bold">
        Resumo
      </CardTitle>
      <CardContent className="p-5">
        {/* NOME E PREÇO */}
        <div className="flex items-center justify-between">
          <h4 className="font-bold">{service.name}</h4>
          <p className="font-semibold">
            {Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(Number(service.price))}
          </p>
        </div>
        {/* DATA*/}
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-gray-400">Data</h4>
          <p className="font-semibold">
            {formatSafe(selectedDate, "dd 'de' MMMM")}
          </p>
        </div>
        {/* HORÁRIO */}
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-gray-400">Horario</h4>
          <p className="font-semibold">{formatSafe(selectedDate, "HH:mm")}</p>
        </div>
        {/* LOCAL */}
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-gray-400">Local</h4>
          <p className="font-semibold">{barbershop?.name}</p>
        </div>
        {/* PAGAMENTO */}
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
  )
}

export default BookingSummary

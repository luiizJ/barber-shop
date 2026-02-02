import { format } from "date-fns"
import { Card, CardContent, CardTitle } from "./ui/card"
import { ptBR } from "date-fns/locale"
import type { BarberServices, BarberShop } from "@prisma/client"

interface BookingSummaryProps {
  service: Pick<BarberServices, "name" | "price">
  barbershop: Pick<BarberShop, "name">
  selectedDate: Date
}

const BookingSummary = ({
  service,
  barbershop,
  selectedDate,
}: BookingSummaryProps) => {
  return (
    <Card className="mt-3 mb-6 w-full">
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
            {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-gray-400">Horario</h4>
          <p className="font-semibold">{format(selectedDate, "HH:mm")}</p>
        </div>
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-gray-400">Local</h4>
          <p className="font-semibold">{barbershop?.name}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default BookingSummary

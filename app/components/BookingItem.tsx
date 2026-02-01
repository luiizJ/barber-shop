import type { Prisma } from "@prisma/client"
import { Avatar, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { Card, CardContent } from "./ui/card"
import { format, isFuture } from "date-fns"
import { ptBR } from "date-fns/locale"

// 1. TIPAGEM  (Utility Types)
interface BookingItemProps {
  booking: Prisma.BookingGetPayload<{
    include: { service: { include: { barberShop: true } } }
  }>
}

const BookingItem = ({ booking }: BookingItemProps) => {
  // 2. LÓGICA DE ESTADO
  // Não salvamos "status: finished" no banco. Calculamos isso em tempo real.
  // Se a data é futuro = Confirmado. Se passado = Finalizado.
  const isConfirmed = isFuture(booking.date)

  return (
    <Card className="min-w-[85%] p-0 md:min-w-full">
      <CardContent className="flex justify-between p-0">
        {/* LADO ESQUERDO: Informações do Serviço */}
        <div className="flex flex-col gap-2 py-5 pl-5">
          {/* 3. FEEDBACK VISUAL CONDICIONAL */}
          {/* O Badge muda de cor (variant) e texto baseado no estado calculado acima */}
          <Badge
            className="w-fit"
            variant={isConfirmed ? "default" : "secondary"}
          >
            {isConfirmed ? "Confirmado" : "Finalizado"}
          </Badge>

          <h3 className="font-semibold">{booking.service.name}</h3>

          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={booking.service.barberShop.imageUrl ?? ""}
                alt="Avatar"
              />
            </Avatar>
            <p className="text-sm">{booking.service.barberShop.name}</p>
          </div>
        </div>

        {/* LADO DIREITO: Data Formatada */}
        {/* date-fns com locale pt-BR para garantir formatação local */}
        <div className="flex flex-col items-center justify-center border-l-2 border-solid px-5">
          <p className="text-sm text-gray-300 uppercase">
            {format(booking.date, "MMM", { locale: ptBR })}
          </p>
          <p className="text-2xl">
            {format(booking.date, "dd", { locale: ptBR })}
          </p>
          <p className="text-sm">
            {format(booking.date, "HH:mm", { locale: ptBR })}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default BookingItem

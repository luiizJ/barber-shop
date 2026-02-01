import { Prisma } from "@prisma/client"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Card, CardContent } from "./ui/card"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { getBookingStatus } from "../utils/get-booking-status"
import BookingBadge from "./BookingBadge"

interface BookingItemProps {
  booking: Prisma.BookingGetPayload<{
    include: { service: { include: { barberShop: true } } }
  }>
}

const BookingItem = ({ booking }: BookingItemProps) => {
  const { variant, label, className } = getBookingStatus({
    date: booking.date,
    status: booking.status,
  })

  return (
    <Card className="min-w-[85%] p-0 md:min-w-full">
      <CardContent className="flex justify-between p-0">
        {/* LADO ESQUERDO */}
        <div className="flex flex-col gap-2 py-5 pl-5">
          {/* 👇 AQUI ESTÁ A "ILHA" DE INTERATIVIDADE */}
          <BookingBadge variant={variant} label={label} className={className} />
          <h3 className="font-semibold">{booking.service.name}</h3>

          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={booking.service.barberShop.imageUrl ?? ""}
                alt={booking.service.barberShop.name}
              />
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
            <p className="text-sm">{booking.service.barberShop.name}</p>
          </div>
        </div>

        {/* LADO DIREITO */}
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

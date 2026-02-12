import { Calendar as CalendarIcon, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Prisma } from "@prisma/client"
import { BookingItem } from "../../../components/BookingItem"

interface DayBookingsListProps {
  selectedDate: Date
  confirmedBookings: any[]
  cancelledBookings: any[]
}

const DayBookingsList = ({
  selectedDate,
  confirmedBookings,
  cancelledBookings,
}: DayBookingsListProps) => {
  const hasNoBookings =
    confirmedBookings.length === 0 && cancelledBookings.length === 0

  return (
    <div className="space-y-6">
      {/* TÍTULO DA DATA */}
      <h2 className="flex items-center gap-2 border-b pb-2 text-xl font-bold capitalize">
        <CalendarIcon className="text-primary h-5 w-5" />
        {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
      </h2>

      {/* ESTADO VAZIO */}
      {hasNoBookings && (
        <div className="bg-muted/20 text-muted-foreground flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-16">
          <CalendarIcon className="mb-3 h-12 w-12 opacity-20" />
          <p className="font-medium">Nenhum agendamento para este dia.</p>
        </div>
      )}

      {/* LISTA DE CONFIRMADOS */}
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
              // Cast forçado para garantir compatibilidade com o componente legado se necessário,
              // mas a tipagem acima já deve resolver.
              booking={booking}
            />
          ))}
        </div>
      )}

      {/* LISTA DE CANCELADOS */}
      {cancelledBookings.length > 0 && (
        <div className="space-y-3 pt-4 opacity-70 transition-opacity hover:opacity-100">
          <div className="flex items-center gap-2 text-red-500/80">
            <AlertCircle className="h-4 w-4" />
            <h3 className="text-sm font-semibold tracking-wider uppercase">
              Cancelados ({cancelledBookings.length})
            </h3>
          </div>
          {cancelledBookings.map((booking) => (
            <BookingItem key={booking.id} booking={booking as any} />
          ))}
        </div>
      )}
    </div>
  )
}

export default DayBookingsList

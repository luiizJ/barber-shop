import { BookingStatus } from "@prisma/client" // 👈 Importamos o Enum do Prisma
import { isFuture } from "date-fns"

interface GetBookingStatusProps {
  status: BookingStatus
  date: Date
}

export const getBookingStatus = ({ status, date }: GetBookingStatusProps) => {
  const isFutureDate = isFuture(date)

  // 1. FINALIZADO (Passado)
  if (!isFutureDate) {
    return {
      variant: "secondary",
      label: "Finalizado",
      className:
        "bg-gray-200 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400",
    } as const
  }

  // 2. CANCELADO
  if (status === BookingStatus.CANCELLED) {
    return {
      variant: "destructive",
      label: "Cancelado",
      className: "",
    } as const
  }

  // 3. PENDENTE
  if (status === BookingStatus.PENDING) {
    return {
      variant: "outline",
      label: "Pendente",
      className:
        "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200",
    } as const
  }

  // 4. CONFIRMADO (Default / Fallback)
  // Se for CONFIRMED ou qualquer outro caso futuro seguro
  return {
    variant: "default",
    label: "Confirmado",
    className: "bg-[#221C3D] text-primary hover:bg-[#221C3D]",
  } as const
}

"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import { Badge } from "@/app/components/ui/badge"
import { Card, CardContent } from "@/app/components/ui/card"
import { format, isFuture } from "date-fns"
import { ptBR } from "date-fns/locale"
import { BookingStatus } from "@prisma/client" // Importante para os tipos
import { MoreHorizontal, XCircle, CheckCircle } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu"
import { toast } from "sonner"
import { useState } from "react"
import { updateBookingStatus } from "@/app/actions/booking-actions"

interface BookingItemProps {
  booking: {
    id: string
    date: Date
    status: BookingStatus // O status vem do banco
    price: number
    service: {
      name: string
      price: number
    }
    user: {
      name: string | null
      image: string | null
    }
  }
}

export function BookingItem({ booking }: BookingItemProps) {
  const [isLoading, setIsLoading] = useState(false)
  const isFutureDate = isFuture(booking.date)

  // Função que chama o Back-end
  const handleStatusChange = async (newStatus: BookingStatus) => {
    setIsLoading(true)
    try {
      await updateBookingStatus(booking.id, newStatus)
      toast.success(
        newStatus === "CANCELLED"
          ? "Agendamento cancelado."
          : "Confirmado com sucesso!",
      )
    } catch (error) {
      toast.error("Erro ao atualizar status.")
    } finally {
      setIsLoading(false)
    }
  }

  // Lógica visual das cores
  const getBadgeVariant = () => {
    if (booking.status === "CANCELLED") return "destructive" // Vermelho
    if (booking.status === "CONFIRMED") return "default" // Preto/Branco
    return "secondary" // Cinza
  }

  const getStatusLabel = () => {
    if (booking.status === "CANCELLED") return "Cancelado"
    if (booking.status === "CONFIRMED")
      return isFutureDate ? "Confirmado" : "Concluído"
    return "Pendente"
  }

  return (
    <Card className="mb-4">
      <CardContent className="flex items-center justify-between p-4">
        {/* LADO ESQUERDO: Cliente e Serviço */}
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={booking.user.image || ""} />
            <AvatarFallback>
              {booking.user.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h3 className="font-bold">{booking.user.name}</h3>
            <p className="text-muted-foreground text-sm">
              {booking.service.name}
            </p>
          </div>
        </div>

        {/* MEIO: Data e Hora */}
        <div className="hidden min-w-[100px] flex-col items-end border-l pl-4 md:flex">
          <span className="font-bold capitalize">
            {format(booking.date, "dd 'de' MMMM", { locale: ptBR })}
          </span>
          <span className="text-muted-foreground text-sm">
            {format(booking.date, "HH:mm")}
          </span>
        </div>

        {/* LADO DIREITO: Status e Preço */}
        <div className="flex min-w-[100px] flex-col items-end gap-2">
          <Badge variant={getBadgeVariant()}>{getStatusLabel()}</Badge>

          {/* Se cancelado, risca o preço e deixa cinza */}
          <span
            className={`text-sm font-bold ${booking.status === "CANCELLED" ? "text-muted-foreground line-through opacity-50" : ""}`}
          >
            {Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(booking.price)}
          </span>
        </div>

        {/* MENU DE AÇÕES (3 Pontinhos) */}
        <div className="ml-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={isLoading}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleStatusChange("CONFIRMED")}>
                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                Confirmar
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => handleStatusChange("CANCELLED")}
                className="text-red-600 focus:text-red-600"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancelar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}

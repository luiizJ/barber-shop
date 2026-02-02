import { Prisma } from "@prisma/client"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Card, CardContent } from "./ui/card"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { getBookingStatus } from "../utils/get-booking-status"
import BookingBadge from "./BookingBadge"
import { BookingStatus } from "@prisma/client"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "./ui/sheet"
import Image from "next/image"
import BarberPhone from "./BarberPhone"
import { Button } from "./ui/button"
import BookingSummary from "./BookingSummary"

// 1. TYPE
// Usamos o "GetPayload" do Prisma para garantir que o TypeScript saiba
// EXATAMENTE quais relações (service, barberShop) foram incluídas na query.
interface BookingItemProps {
  booking: Prisma.BookingGetPayload<{
    include: { service: { include: { barberShop: true } } }
  }>
}

// 2. SERVER COMPONENT
const BookingItem = ({ booking }: BookingItemProps) => {
  // 3. BUSINESS LOGIC ABSTRACTION
  // A lógica de "qual cor usar" ou "qual texto exibir" não fica aqui.
  const { variant, label, className } = getBookingStatus({
    date: booking.date,
    status: booking.status,
  })

  return (
    // ROOT DO COMPONENTE: O Sheet controla o estado (aberto/fechado)
    <Sheet>
      {/* 4. COMPOSITION PATTERN (Padrão de Composição) */}
      <SheetTrigger className="" asChild>
        <Card className="min-w-[85%] p-0 md:min-w-full">
          <CardContent className="flex w-full justify-between p-0 px-5">
            {/* LADO ESQUERDO: Informações principais e Status */}
            <div className="flex flex-col gap-2 py-5">
              <BookingBadge
                variant={variant}
                label={label}
                className={className}
              />
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

            {/* LADO DIREITO: Data Formatada */}
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
      </SheetTrigger>

      {/* CONTEÚDO DO MODAL (SHEET) */}
      <SheetContent className="w-[85%] p-5">
        <SheetHeader className="p-0 text-left font-bold">
          <SheetTitle>Detalhes do Agendamento</SheetTitle>
          <SheetDescription className="hidden">
            Informações detalhadas sobre o agendamento
          </SheetDescription>
        </SheetHeader>
        {/* 6. UI LAYOUT: IMAGEM + CARD FLUTUANTE 🎨 */}
        <div className="relative mt-6 flex h-[180px] w-full items-end">
          <Image
            fill
            className="rounded-xl object-cover"
            src={booking.service.barberShop.imageUrl ?? ""}
            alt=""
          />
          {/* Card interno com dados da barbearia */}
          <Card className="z-50 mx-5 mb-3 w-full rounded-xl">
            <CardContent className="flex items-center gap-3 px-2">
              <Avatar>
                <AvatarImage
                  src={booking.service.barberShop.imageUrl ?? ""}
                  alt={booking.service.barberShop.name}
                />
              </Avatar>
              <div>
                <h3 className="font-bold uppercase">
                  {booking.service.barberShop.name}
                </h3>
                <h4 className="text-sm">
                  {booking.service.barberShop.address}
                </h4>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* SEÇÃO DE RESUMO FINANCEIRO */}
        <div className="mt-5">
          <BookingBadge variant={variant} label={label} className={className} />
          <BookingSummary
            barbershop={booking.service.barberShop}
            service={booking.service}
            selectedDate={booking.date}
          />
        </div>
        {/* LISTA DE TELEFONES (Iteração de Arrays) */}
        <div className="mx-3 space-y-2">
          {booking.service.barberShop.phones.map((phone, index) => (
            // Usamos index na key apenas porque strings de telefone podem repetir,
            <BarberPhone key={index} phone={phone} />
          ))}
        </div>
        {/* RODAPÉ E AÇÕES (Footer) */}
        <SheetFooter>
          <div className="flex items-center justify-between">
            {/* Botão de Voltar fecha o Modal */}
            <SheetClose asChild className="w-[40%]">
              <Button className="h-10 p-3" variant={"secondary"}>
                Voltar
              </Button>
            </SheetClose>
            {/* 7. CONDITIONAL RENDERING (Renderização Condicional)  */}
            {/* O botão de pagar SÓ aparece se o status for estritamente PENDING. 
                Isso protege o fluxo de usuário. */}
            {booking.status === BookingStatus.PENDING && (
              <Button className="h-10 p-3" variant={"default"}>
                Prosseguir para pagamento
              </Button>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default BookingItem

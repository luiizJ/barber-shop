import { getServerSession } from "next-auth"
import Header from "../components/Header"
import { authOptions } from "../lib/auth"
import { db } from "../lib/prisma"
import { notFound } from "next/navigation"
import BookingItem from "../components/BookingItem"

const BookingsPage = async () => {
  //pegar sessão do usuário
  const session = await getServerSession(authOptions)
  //mostrat pop-up de login se não estiver logado
  if (!session?.user) {
    notFound()
  }
  //pegar agendamentos do usuário via banco de dados
  const confirmedBookings = await db.booking.findMany({
    where: {
      userId: (session.user as any).id,
      date: {
        gte: new Date(),
      },
    },
    include: {
      service: {
        include: {
          barberShop: true,
        },
      },
    },
    orderBy: {
      date: "asc",
    },
  })
  const finishedBookings = await db.booking.findMany({
    where: {
      userId: (session.user as any).id,
      date: {
        lt: new Date(),
      },
    },
    include: {
      service: {
        include: {
          barberShop: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  })
  return (
    <>
      <Header />
      <div className="p-5">
        <h1 className="text-xl font-bold">Agendamentos</h1>

        {/* SEÇÃO DE CONFIRMADOS */}
        <h2 className="mt-6 text-xs font-bold text-gray-400 uppercase">
          Confirmados
        </h2>
        <div className="mt-3 flex flex-col gap-3">
          {confirmedBookings.map((booking) => (
            <BookingItem key={booking.id} booking={booking} />
          ))}
        </div>

        {/* SEÇÃO DE HISTÓRICO (AQUI ENTRA O CONCEITO DE HISTORY) */}
        <h2 className="mt-6 text-xs font-bold text-gray-400 uppercase">
          Finalizados
        </h2>
        <div className="mt-3 flex flex-col gap-3">
          {finishedBookings.map((booking) => (
            <BookingItem key={booking.id} booking={booking} />
          ))}
        </div>
      </div>
    </>
  )
}

export default BookingsPage

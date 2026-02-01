import Header from "./components/Header"
import BarbershopItem from "./components/BarbershopItem"
import { db } from "./lib/prisma"
import ExclusiveBanner from "./components/ExclusiveBanner"
import SearchbarberShops from "./components/SearchbarberShops"
import BookingItem from "./components/BookingItem"
import { getServerSession } from "next-auth"
import { authOptions } from "./lib/auth"
import { notFound } from "next/navigation"

export const Page = async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    notFound()
  }
  const barberShop = await db.barberShop.findMany({})
  const bookings = await db.booking.findMany({
    where: {
      userId: (session.user as any).id,
      date: {
        gte: new Date(),
      },
    },
    include: {
      service: {
        include: { barberShop: true },
      },
    },
    orderBy: {
      date: "asc",
    },
  })
  return (
    <>
      <Header />
      <div className="p-5">
        <h2 className="text-xl font-bold">Ola, Usuario!</h2>
        <p>Terça feira, 27 de janeiro de 2026</p>
        {/*Busca / Categoria */}
        <div className="mt-6">
          <SearchbarberShops />
        </div>
        {/*Banner Principal*/}
        <ExclusiveBanner />
        {/*Agendamentos*/}
        <h2 className="mt-5 text-xs font-bold text-gray-400 uppercase">
          Agendamentos
        </h2>
        <div className="flex gap-3 overflow-x-auto pt-5 [&::-webkit-scrollbar]:hidden">
          {bookings.map((booking) => (
            <BookingItem key={booking.id} booking={booking} />
          ))}
        </div>
        {/*Recomendados*/}
        <h2 className="mt-6 mb-3 text-xs font-bold text-gray-400 uppercase">
          Recomendados
        </h2>
        <div className="flex gap-4 overflow-auto [&::-webkit-scrollbar]:hidden">
          {barberShop.map((barberShop) => (
            <BarbershopItem key={barberShop.id} barberShop={barberShop} />
          ))}
        </div>
        <h2 className="mt-6 mb-3 text-xs font-bold text-gray-400 uppercase">
          Populares
        </h2>
        <div className="flex gap-4 overflow-auto [&::-webkit-scrollbar]:hidden">
          {barberShop.map((barberShop) => (
            <BarbershopItem key={barberShop.id} barberShop={barberShop} />
          ))}
        </div>
      </div>
    </>
  )
}
export default Page

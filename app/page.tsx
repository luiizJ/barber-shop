import Header from "./components/Header"
import BarbershopItem from "./components/BarbershopItem"
import { db } from "./lib/prisma"
import Booking from "./components/Booking"
import EclusiveBanner from "./components/ExclusiveBanner"
import SearchbarberShops from "./components/SearchbarberShops"

export const Page = async () => {
  const barberShop = await db.barberShop.findMany({})
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
        <EclusiveBanner />
        {/*Agendamentos*/}
        <Booking />
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

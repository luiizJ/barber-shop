import Header from "./components/Header"
import { BarbershopEstablishments } from "./components/BarbershopEstablishments"
import { db } from "./lib/prisma"
import Booking from "./components/Booking"
import Footer from "./components/Footer"
import SearchBarberShops from "./components/SearchBarberShops"
import EclusiveBanner from "./components/ExclusiveBanner"

export const Page = async () => {
  const barberShop = await db.barberShop.findMany({})
  return (
    <>
      <Header />
      <div className="p-5">
        <h2 className="text-xl font-bold">Ola, Usuario!</h2>
        <p>Terça feira, 27 de janeiro de 2026</p>
        {/*Busca / Categoria */}
        <SearchBarberShops />
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
            <BarbershopEstablishments
              key={barberShop.id}
              barberShop={barberShop}
            />
          ))}
        </div>
        <h2 className="mt-6 mb-3 text-xs font-bold text-gray-400 uppercase">
          Populares
        </h2>
        <div className="flex gap-4 overflow-auto [&::-webkit-scrollbar]:hidden">
          {barberShop.map((barberShop) => (
            <BarbershopEstablishments
              key={barberShop.id}
              barberShop={barberShop}
            />
          ))}
        </div>
      </div>
      {/*Footer*/}
      <Footer />
    </>
  )
}
export default Page

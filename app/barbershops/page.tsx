import { db } from "@/app/lib/prisma"
import BarbershopItem from "@/app/components/BarbershopItem" // Card da Loja
import BarberShopServices from "@/app/components/BarberShopServices" // Card do Serviço (Reutilizado!)
import Header from "@/app/components/Header"
import { redirect } from "next/navigation"
import SearchbarberShops from "../components/SearchbarberShops"

interface BarbershopsPageProps {
  searchParams: Promise<{
    search?: string
    service?: string
  }>
}

const BarbershopsPage = async (props: BarbershopsPageProps) => {
  const searchParams = await props.searchParams

  if (!searchParams.search && !searchParams.service) {
    // return redirect("/")
  }

  const searchTerm = searchParams.search || searchParams.service

  const [barbershops, services] = await Promise.all([
    db.barberShop.findMany({
      where: {
        name: { contains: searchTerm, mode: "insensitive" },
      },
    }),
    db.barberServices.findMany({
      where: {
        name: { contains: searchTerm, mode: "insensitive" },
      },
      include: {
        barberShop: true,
      },
    }),
  ])

  return (
    <>
      <Header />
      <div className="gap-6 px-3 py-6">
        <SearchbarberShops />
      </div>

      <div className="flex flex-col gap-6 px-4 pb-6">
        <h1 className="text-xs font-bold text-gray-400 uppercase">
          Resultados para &quot;{searchTerm}&quot;
        </h1>

        {/* LISTA DE BARBEARIAS */}
        {barbershops.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {barbershops.map((shop) => (
              <BarbershopItem barberShop={shop} key={shop.id} />
            ))}
          </div>
        )}

        {/* LISTA DE SERVIÇOS REUTILIZANDO O COMPONENTE */}
        {services.length > 0 && (
          <div className="mt-4 flex flex-col gap-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase">
              Serviços
            </h2>
            {services.map((service) => (
              <BarberShopServices key={service.id} services={service} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default BarbershopsPage

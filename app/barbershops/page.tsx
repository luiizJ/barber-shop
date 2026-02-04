import { db } from "@/app/lib/prisma"
import BarbershopItem from "@/app/components/BarbershopItem" // Card da Loja
import BarberShopServices from "@/app/components/BarberShopServices" // Card do Serviço (Reutilizado!)
import Header from "@/app/components/Header"
import SearchbarberShops from "../components/SearchBarberShops"
import type { BarberShop } from "@prisma/client"
import { getSearchResults } from "../data/get-search-results"

interface BarbershopsPageProps {
  searchParams: Promise<{
    search?: string
    service?: string
  }>
  barberShop?: BarberShop
}

const BarbershopsPage = async ({ searchParams }: BarbershopsPageProps) => {
  const params = await searchParams
  // Definimos o termo de busca (Pode vir do input 'search' OU do botão rápido 'service')
  const searchTerm = params.search || params.service

  if (!searchTerm) {
    // return redirect("/")
  }

  const { barbershops, services } = await getSearchResults({
    search: searchTerm || "",
  })

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
              <BarberShopServices
                key={service.id}
                barberShop={{
                  id: service.barberShop!.id,
                  name: service.barberShop!.name,
                  phones: service.barberShop!.phones,
                  slug: service.barberShop!.slug,
                }}
                services={{
                  id: service.id,
                  name: service.name,
                  description: service.description,
                  imageUrl: service.imageUrl,
                  barberShopId: service.barberShopId,
                  price: Number(service.price),
                }}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default BarbershopsPage

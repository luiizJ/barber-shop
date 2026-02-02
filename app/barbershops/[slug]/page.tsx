import BarberPhone from "@/app/components/BarberPhone"
import BarberShopServices from "@/app/components/BarberShopServices"
import Sidebar from "@/app/components/Sidebar"
import { Button } from "@/app/components/ui/button"
import { Sheet, SheetTrigger } from "@/app/components/ui/sheet"
import { getBarberShop } from "@/app/data/get-barbeshop"
import { db } from "@/app/lib/prisma"
import { ChevronLeft, MapPinIcon, MenuIcon, StarIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

export interface BarberShopPageProps {
  params: Promise<{
    slug: string
  }>
}

const BarberShopPage = async ({ params }: BarberShopPageProps) => {
  // 1. Aguardar os parâmetros carregarem
  const { slug } = await params
  // 2. Busca no banco
  const barbershop = await getBarberShop({ slug })
  // 3. Se não achar, joga pro 404 oficial do Next, implementar nova badRequest depois..
  if (!barbershop) {
    return notFound()
  }

  return (
    <>
      {/* Area da Imagem */}
      <div className="relative h-[250px] w-full">
        <Image
          src={barbershop.imageUrl}
          alt={barbershop.name}
          fill
          className="object-cover"
        />
        <Button
          size={"icon"}
          variant={"secondary"}
          className="absolute top-4 left-4"
          asChild
        >
          <Link href="/">
            <ChevronLeft />
          </Link>
        </Button>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="absolute top-4 right-4"
            >
              <MenuIcon />
            </Button>
          </SheetTrigger>
          <Sidebar />
        </Sheet>
      </div>
      {/* Area do titulo / endereço */}
      <div className="border-b border-solid p-5">
        <h1 className="mb-2 text-xl font-bold">{barbershop.name}</h1>
        <div className="mb-2 flex items-center gap-2">
          <MapPinIcon className="text-primary" size={18} />
          <p className="text-sm">{barbershop.address}</p>
        </div>
        <div className="flex items-center gap-2">
          <StarIcon className="text-primary fill-primary" size={18} />
          <p className="text-sm">5,0 (576 Avaliaçoes)</p>
        </div>
      </div>
      {/* Area da Descriçao */}
      <div className="space-y-2 border-b border-solid p-5">
        <h2 className="text-xs font-bold text-gray-400 uppercase">Sobre Nos</h2>
        <p className="text-justify text-sm">{barbershop.description}</p>
      </div>
      {/* Area dos Serviços */}
      <div className="p-5">
        <h2 className="mb-3 text-xs font-bold text-gray-400 uppercase">
          Serviços
        </h2>
        <div className="space-y-3 p-1">
          {barbershop.services.map((service) => (
            <BarberShopServices services={service} key={service.id} />
          ))}
        </div>
        {/* Area dos Contatos */}
        <div className="mt-5 space-y-3 border-t border-solid p-5">
          <h2 className="text-xs font-bold text-gray-400 uppercase">
            Contatos
          </h2>
          {barbershop.phones.map((phone) => (
            <BarberPhone phone={phone} key={phone} />
          ))}
        </div>
      </div>
    </>
  )
}
export default BarberShopPage

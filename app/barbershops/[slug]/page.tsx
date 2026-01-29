import { Button } from "@/app/components/ui/button"
import { db } from "@/app/lib/prisma"
import { ChevronLeft, MapPinIcon, MenuIcon, Star, StarIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

interface BarberShopPageProps {
  params: Promise<{
    slug: string
  }>
}

const BarberShopPage = async ({ params }: BarberShopPageProps) => {
  // 1. Aguardar os parâmetros carregarem
  const { slug } = await params
  // 2. Busca no banco
  const barbershop = await db.barberShop.findUnique({
    where: {
      slug: slug,
    },
  })
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

        <Button
          size={"icon"}
          variant={"secondary"}
          className="absolute top-4 right-4"
        >
          <MenuIcon />
        </Button>
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
      <div className="space-y-3 border-b border-solid p-5">
        <h2 className="text-xs font-bold text-gray-400 uppercase">Sobre Nos</h2>
        <p className="text-justify text-sm">{barbershop.description}</p>
      </div>
    </>
  )
}
export default BarberShopPage

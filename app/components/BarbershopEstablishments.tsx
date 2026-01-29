import type { BarberShop } from "@prisma/client"
import { Card, CardContent } from "./ui/card"
import Image from "next/image"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { StarIcon } from "lucide-react"
import Link from "next/link"

interface BarberShopItemProps {
  barberShop: BarberShop
}

export const BarbershopEstablishments = ({
  barberShop,
}: BarberShopItemProps) => {
  return (
    <>
      <Card className="min-w-[170px] rounded-2xl py-2">
        <CardContent className="p-0 px-2 pt-1">
          {/*Area da imagem*/}
          <div className="relative h-[159px] w-full">
            <Image
              src={barberShop.imageUrl}
              alt={barberShop.name}
              fill
              className="rounded-2xl object-cover"
            />
            <Badge className="absolute top-2 right-2" variant={"secondary"}>
              <StarIcon size={12} className="fill-primary text-primary" />
              {/* substituir por dados reais do banco de dados */}
              <p className="text-xs font-semibold">5,0</p>
            </Badge>
          </div>
          {/*Area da descriçao (corrigir comportamento do card a partir da descriçao)*/}
          <div className="py-3">
            <h3 className="overflow-hidden font-semibold text-nowrap text-ellipsis">
              {barberShop.name}
            </h3>
            <p className="text-sm text-gray-400">{barberShop.address}</p>
            <p className="text-sm">{barberShop.description}</p>
            <Button variant="secondary" className="mt-3 w-full" asChild>
              <Link href={`/barbershops/${barberShop.slug}`}>Agendar</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      {/*AREA DE EXEMPLO (LAYOUT) APAGAR DAQUI PARA BAIXO ANTES DE SUBIR PRA PROD*/}
      <Card className="min-w-[170px] rounded-2xl py-2">
        <CardContent className="p-0 px-2 pt-1">
          {/*Area da imagem*/}
          <div className="relative h-[159px] w-full">
            <Image
              src={barberShop.imageUrl}
              alt={barberShop.name}
              fill
              className="rounded-xl object-cover"
            />
          </div>
          {/*Area da descriçao (corrigir comportamento do card a partir da descriçao)*/}
          <div className="py-3">
            <h3 className="overflow-hidden font-semibold text-nowrap text-ellipsis">
              {barberShop.name}
            </h3>
            <p className="text-sm text-gray-400">{barberShop.address}</p>
            <p className="text-sm">{barberShop.description}</p>
            <Button variant="secondary" className="mt-3 w-full">
              Agendar
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

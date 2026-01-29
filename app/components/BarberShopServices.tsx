import type { BarberServices } from "@prisma/client"
import Image from "next/image"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import Link from "next/link"

interface BarberShopServicesProps {
  services: BarberServices
}

const BarberShopServices = ({ services }: BarberShopServicesProps) => {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        {/* Area da imagem */}
        <div className="relative max-h-[110px] min-h-[110px] max-w-[110px] min-w-[110px]">
          <Image
            fill
            className="rounded-lg object-cover"
            src={services.imageUrl}
            alt={services.name}
          />
        </div>
        {/* Area do conteudo */}
        <div className="flex flex-1 flex-col space-y-3">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">{services.name}</h3>
            <p className="line-clamp-2 text-sm text-gray-400">
              {services.description}
            </p>
          </div>
          {/* Area do botao e preço */}
          <div className="mt-auto flex w-full items-center justify-between">
            <p className="text-primary text-sm font-bold">
              {Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(Number(services.price))}
            </p>
            <Button size="sm" variant={"secondary"} asChild>
              <Link href={"/Agendamentos"}>Agendar</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default BarberShopServices

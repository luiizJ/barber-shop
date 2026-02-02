import { BarberServices, BarberShop } from "@prisma/client"
import Image from "next/image"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import Link from "next/link"
import Scheduling from "./Scheduling"

interface BarberShopServicesProps {
  services: BarberServices & { barberShop?: BarberShop }
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
        <div className="flex flex-1 flex-col space-y-2">
          <div className="space-y-1">
            {/* SE TIVER BARBEARIA (Modo Pesquisa), MOSTRA O NOME DELA */}
            {services.barberShop && (
              <p className="text-primary text-xs font-bold uppercase">
                Oferecido por {services.barberShop.name}
              </p>
            )}

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

            {/* LÓGICA INTELIGENTE DO BOTÃO */}
            {services.barberShop ? (
              // CENÁRIO 1: MODO PESQUISA (Apenas navega para a loja)
              <Button size="sm" variant="secondary" asChild>
                <Link href={`/barbershops/${services.barberShop.slug}`}>
                  Ver Loja
                </Link>
              </Button>
            ) : (
              // CENÁRIO 2: MODO AGENDAMENTO (Abre o Modal/Sheet)
              <Scheduling
                service={{
                  id: services.id,
                  barberShopId: services.barberShopId,
                  name: services.name,
                  description: services.description,
                  imageUrl: services.imageUrl,
                  price: Number(services.price),
                }}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default BarberShopServices

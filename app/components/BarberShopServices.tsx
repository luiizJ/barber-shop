import { BarberServices, BarberShop } from "@prisma/client"
import Image from "next/image"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import Link from "next/link"

interface BarberShopServicesProps {
  services: BarberServices & { barbershop?: BarberShop }
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
            {services.barbershop && (
              <p className="text-primary text-xs font-bold uppercase">
                {services.barbershop.name}
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
            <Button size="sm" variant="secondary" asChild>
              {/* Se tiver barbearia (estou na pesquisa) -> Vai para a página da loja
                   Se não tiver (já estou na loja) -> Vai para Agendamentos (ou abre modal depois)
                */}
              <Link
                href={
                  services.barbershop
                    ? `/barbershops/${services.barbershop.id}`
                    : "/Agendamentos"
                }
              >
                {services.barbershop ? "Ver Loja" : "Agendar"}
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default BarberShopServices

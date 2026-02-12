"use client"

import { Card, CardContent, CardFooter } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Trash2 } from "lucide-react"

import { toast } from "sonner"
import Image from "next/image"
import { deleteService } from "@/app/actions/barber-actions"
import { ManageServiceDialog } from "./ManageServiceDialog"

// 👇 Atualizamos a Interface para aceitar Number
interface ServiceItemProps {
  service: {
    id: string
    name: string
    description: string
    imageUrl: string
    price: number // Mudou de Decimal/any para number
    barberShopId: string
  }
}

const ServiceItem = ({ service }: ServiceItemProps) => {
  const handleDelete = async () => {
    const confirm = window.confirm(
      `Tem certeza que deseja excluir "${service.name}"?`,
    )
    if (!confirm) return

    try {
      await deleteService(service.id)
      toast.success("Serviço excluído.")
    } catch (error) {
      toast.error("Erro ao excluir.")
    }
  }

  return (
    <Card className="group flex flex-col overflow-hidden p-3 transition-shadow duration-300 hover:shadow-lg">
      {/* ÁREA DA IMAGEM */}
      <div className="bg-muted relative flex h-50 w-full items-center">
        {service.imageUrl ? (
          <Image
            src={service.imageUrl}
            alt={service.name}
            fill
            className="rounded-md object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="text-muted-foreground bg-muted/50 flex h-full w-full items-center justify-center">
            Sem foto
          </div>
        )}

        {/* Badge de Preço flutuante */}
        <div className="absolute right-2 bottom-2 rounded-full bg-black/80 px-3 py-1 text-sm font-bold text-white shadow-sm backdrop-blur-sm">
          {Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(service.price)}
        </div>
      </div>

      <CardContent className="flex-1 space-y-1">
        <h3
          className="truncate text-lg leading-tight font-bold"
          title={service.name}
        >
          {service.name}
        </h3>
        <p className="text-muted-foreground line-clamp-2 min-h-10 text-sm">
          {service.description || "Sem descrição definida."}
        </p>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2 p-1 pt-0">
        {/* Botão Editar (O Dialog gera o botão) */}
        <div className="w-full">
          {/*  TypeScript reclama se passar o tipo errado, mas agora tá alinhado */}
          <ManageServiceDialog service={service as any} />
        </div>

        <Button
          variant="destructive"
          size="icon"
          onClick={handleDelete}
          className="shrink-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
export default ServiceItem

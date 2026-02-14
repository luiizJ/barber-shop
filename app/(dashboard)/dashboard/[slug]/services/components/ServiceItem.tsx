"use client"

import { Card, CardContent, CardFooter } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import { deleteService } from "@/app/actions/barber-actions"
import { ManageServiceDialog } from "./ManageServiceDialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/components/ui/alert-dialog"

interface ServiceItemProps {
  service: {
    id: string
    name: string
    description: string
    imageUrl: string
    price: number
    barberShopId: string
  }
}

const ServiceItem = ({ service }: ServiceItemProps) => {
  const handleDelete = async () => {
    try {
      const result = await deleteService(service.id)

      if (result?.error) {
        toast.error(result.error, {
          description: result.description,
          duration: 5000,
        })
        return
      }

      toast.success("Serviço excluído com sucesso!")
    } catch (error) {
      toast.error("Ocorreu um erro inesperado ao tentar excluir.")
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
        <div className="w-full">
          <ManageServiceDialog service={service as any} />
        </div>

        {/* --- ALERT DIALOG PARA EXCLUSÃO --- */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon" className="shrink-0">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="w-[90%] rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir serviço?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. O serviço{" "}
                <strong>{service.name}</strong> será removido permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-col gap-3 pt-4 sm:flex-col">
              <AlertDialogAction
                onClick={handleDelete}
                className="w-full rounded-xl bg-red-600 py-6 font-bold text-white hover:bg-red-700"
              >
                Excluir
              </AlertDialogAction>

              <AlertDialogCancel className="bg-secondary hover:bg-secondary/80 mt-0 w-full rounded-xl border-none py-6 font-bold">
                Cancelar
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}

export default ServiceItem

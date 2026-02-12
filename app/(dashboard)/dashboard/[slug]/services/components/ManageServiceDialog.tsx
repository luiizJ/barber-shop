"use client"

import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/app/components/ui/dialog"
import { useState } from "react"
import { toast } from "sonner"
import { PlusCircle, Loader2, Edit } from "lucide-react"
import { BarberServices } from "@prisma/client"
import { upsertService } from "@/app/actions/barber-actions"
import { ImageUpload } from "@/app/components/ImageUpload"

interface ManageServiceDialogProps {
  service?: BarberServices
  shopId?: string
}

export const ManageServiceDialog = ({
  service,
  shopId,
}: ManageServiceDialogProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [imageUrl, setImageUrl] = useState(service?.imageUrl || "")

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true)
    try {
      if (service?.id) {
        formData.append("id", service.id)
      }

      if (shopId) {
        formData.append("barberShopId", shopId)
      }
      // Garante que a URL da imagem vá junto
      if (imageUrl) {
        formData.delete("imageUrl") // Remove duplicatas se houver
        formData.append("imageUrl", imageUrl)
      }

      await upsertService(formData)

      toast.success(service ? "Serviço atualizado!" : "Serviço criado!")
      setIsOpen(false)
      // Resetar form se for criação (opcional, mas bom pra UX)
      if (!service) setImageUrl("")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {service ? (
          // Botão de Edição (Pequeno)
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" /> Editar
          </Button>
        ) : (
          // Botão de Criação (Grande)
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Novo Serviço
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {service ? "Editar Serviço" : "Novo Serviço"}
          </DialogTitle>
          <DialogDescription>
            {service
              ? "Faça alterações no serviço. Clique em salvar quando terminar."
              : "Preencha os dados para adicionar ao seu cardápio."}
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="grid gap-4 py-4">
          {shopId && <input type="hidden" name="barberShopId" value={shopId} />}
          {/* FOTO (Agora centralizada e maior destaque) */}
          <div className="grid gap-2">
            <Label>Foto do Serviço</Label>
            <ImageUpload value={imageUrl} onChange={setImageUrl} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* NOME */}
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                name="name"
                defaultValue={service?.name}
                placeholder="Ex: Corte Degrade"
                required
              />
            </div>

            {/* PREÇO (Com máscara de R$ opcional, ou number simples) */}
            <div className="grid gap-2">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                defaultValue={service ? Number(service.price) : ""}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* DESCRIÇÃO */}
          <div className="grid gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              name="description"
              defaultValue={service?.description}
              placeholder="Detalhes (tesoura, máquina, navalha...)"
            />
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {service ? "Salvar Alterações" : "Criar Serviço"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

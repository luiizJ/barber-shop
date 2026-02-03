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
} from "@/app/components/ui/dialog"
import { useState } from "react"
import { toast } from "sonner"
import { Loader2, Scissors } from "lucide-react"
import { useRouter } from "next/navigation"
import { createBarbershop } from "@/app/actions/barber-actions"
import { ImageUpload } from "@/app/components/image-upload"

export function CreateShopDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true)
    try {
      await createBarbershop(formData)
      toast.success("Barbearia criada com sucesso! Bem-vindo ao time.")
      setIsOpen(false)
      router.refresh() // Recarrega a página para sumir o aviso e aparecer o dashboard
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar barbearia.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Scissors className="h-4 w-4" /> Criar minha Barbearia
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vamos começar!</DialogTitle>
          <DialogDescription>
            Insira os dados básicos do seu negócio. Você pode alterar tudo
            depois.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Logotipo / Fachada</Label>
            <ImageUpload
              value={imageUrl}
              onChange={(url) => setImageUrl(url)}
            />
            {/* 👈 3. Input Escondido para mandar pro Server Action */}
            <input type="hidden" name="imageUrl" value={imageUrl} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Nome da Barbearia</Label>
            <Input
              id="name"
              name="name"
              placeholder="Ex: Dom Bigode"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              name="address"
              placeholder="Rua das Tesouras, 123"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">Telefone / WhatsApp</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="(00) 00000-0000"
              required
            />
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lançar Barbearia 🚀
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

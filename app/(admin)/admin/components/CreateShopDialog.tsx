"use client"

import { Button } from "@/app/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { createBarbershop } from "@/app/actions/barber-actions"

const formSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  address: z.string().min(5, "Endereço obrigatório"),
  phone: z.string().min(10, "Telefone inválido"),
  description: z.string().min(10, "Descrição muito curta"),
  imageUrl: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function CreateShopDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = async (data: FormValues) => {
    try {
      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("address", data.address)
      formData.append("phone", data.phone)
      formData.append("description", data.description)
      if (data.imageUrl) formData.append("imageUrl", data.imageUrl)

      const result = await createBarbershop(formData)

      // 🛑 ERRO DO SERVIDOR (Ex: Limite Atingido)
      if (result?.error) {
        toast.error("Ops! Não foi possível criar.", {
          description: result.error, // Mostra a mensagem do servidor
        })
        return // 👈 Para aqui e mantém o modal aberto
      }

      // ✅ SUCESSO
      if (result?.success) {
        toast.success("Barbearia criada com sucesso!", {
          description: "Vamos configurar seus serviços agora.",
        })

        setIsOpen(false) // Fecha modal
        reset() // Limpa campos
        router.push("/dashboard/services") // 👈 Redireciona para serviços
        router.refresh() // Atualiza sidebar
      }
    } catch (error) {
      console.error(error)
      toast.error("Erro inesperado. Tente novamente.")
    }
  }

  // Reseta o form se o usuário fechar o modal manualmente
  const handleOpenChange = (open: boolean) => {
    if (!open) reset()
    setIsOpen(open)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2 font-bold">
          Criar minha Barbearia
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Barbearia</DialogTitle>
          <DialogDescription>
            Preencha os dados da sua barbearia para começar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          {/* NOME */}
          <div className="grid gap-2">
            <Label htmlFor="name" className={errors.name ? "text-red-500" : ""}>
              Nome da Barbearia
            </Label>
            <Input
              id="name"
              placeholder="Ex: Barbearia do Zé"
              {...register("name")}
              className={
                errors.name ? "border-red-500 focus-visible:ring-red-500" : ""
              }
            />
            {errors.name && (
              <span className="text-xs font-medium text-red-500">
                {errors.name.message}
              </span>
            )}
          </div>

          {/* ENDEREÇO */}
          <div className="grid gap-2">
            <Label
              htmlFor="address"
              className={errors.address ? "text-red-500" : ""}
            >
              Endereço
            </Label>
            <Input
              id="address"
              placeholder="Rua X, 123"
              {...register("address")}
              className={
                errors.address
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }
            />
            {errors.address && (
              <span className="text-xs font-medium text-red-500">
                {errors.address.message}
              </span>
            )}
          </div>

          {/* TELEFONE */}
          <div className="grid gap-2">
            <Label
              htmlFor="phone"
              className={errors.phone ? "text-red-500" : ""}
            >
              Telefone / WhatsApp
            </Label>
            <Input
              id="phone"
              placeholder="(11) 99999-9999"
              {...register("phone")}
              className={
                errors.phone ? "border-red-500 focus-visible:ring-red-500" : ""
              }
            />
            {errors.phone && (
              <span className="text-xs font-medium text-red-500">
                {errors.phone.message}
              </span>
            )}
          </div>

          {/* DESCRIÇÃO */}
          <div className="grid gap-2">
            <Label
              htmlFor="description"
              className={errors.description ? "text-red-500" : ""}
            >
              Descrição
            </Label>
            <Input
              id="description"
              placeholder="A melhor da região..."
              {...register("description")}
              className={
                errors.description
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }
            />
            {errors.description && (
              <span className="text-xs font-medium text-red-500">
                {errors.description.message}
              </span>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              "Finalizar Cadastro"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

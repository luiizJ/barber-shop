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
import { Loader2, PlusCircle } from "lucide-react" // Troquei Scissors por PlusCircle pra padronizar
import { toast } from "sonner"
import { ImageUpload } from "@/app/components/ImageUpload"
import { Textarea } from "@/app/components/ui/textarea"
import { createBarbershop } from "@/app/actions/barber-actions"

// 1. Schema de Validação
const formSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  address: z.string().min(5, "Endereço obrigatório"),
  phone: z.string().min(10, "Telefone inválido"),
  description: z.string().min(10, "Descrição muito curta (min 10 letras)"),
  imageUrl: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function CreateShopDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  // 2. Configuração do Formulário
  const {
    register,
    handleSubmit,
    setValue, // Para atualizar o ImageUpload manualmente
    watch, // Para ver o valor atual da imagem
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  })

  // Observa o valor da imagem para passar pro componente ImageUpload
  const imageUrl = watch("imageUrl")

  // 3. Função de Envio
  const onSubmit = async (data: FormValues) => {
    try {
      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("address", data.address)
      formData.append("phone", data.phone)
      formData.append("description", data.description)
      if (data.imageUrl) formData.append("imageUrl", data.imageUrl)

      // Chama o Server Action
      const result = await createBarbershop(formData)

      // ❌ Erro do Servidor (ex: Limite atingido)
      if (result?.error) {
        toast.error("Não foi possível criar", {
          description: result.error,
        })
        return
      }

      // ✅ Sucesso
      if (result?.success) {
        toast.success("Barbearia criada com sucesso!", {
          description: "Bem-vindo ao time! Vamos configurar seus serviços.",
        })
        setIsOpen(false)
        reset()
        router.push("/dashboard/services") // Redireciona para serviços
        router.refresh()
      }
    } catch (error) {
      console.error(error)
      toast.error("Erro inesperado. Tente novamente.")
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) reset()
    setIsOpen(open)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {/* Botão visualmente consistente */}
        <Button variant="outline" className="gap-2">
          <PlusCircle size={16} />
          Nova Filial
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Vamos começar!</DialogTitle>
          <DialogDescription>
            Insira os dados básicos do seu negócio. Você pode alterar tudo
            depois.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          {/* UPLOAD DE IMAGEM */}
          <div className="grid gap-2">
            <Label>Logotipo / Fachada</Label>
            <ImageUpload
              value={imageUrl || ""}
              onChange={(url) => setValue("imageUrl", url)}
            />
          </div>

          {/* NOME */}
          <div className="grid gap-2">
            <Label htmlFor="name" className={errors.name ? "text-red-500" : ""}>
              Nome da Barbearia
            </Label>
            <Input
              id="name"
              placeholder="Ex: Dom Bigode"
              {...register("name")}
              className={
                errors.name ? "border-red-500 focus-visible:ring-red-500" : ""
              }
            />
            {errors.name && (
              <span className="text-xs text-red-500">
                {errors.name.message}
              </span>
            )}
          </div>

          {/* DESCRIÇÃO (TEXTAREA) */}
          <div className="grid gap-2">
            <Label
              htmlFor="description"
              className={errors.description ? "text-red-500" : ""}
            >
              Descrição
            </Label>
            <Textarea
              id="description"
              placeholder="Conte um pouco sobre sua barbearia..."
              {...register("description")}
              className={`resize-none ${errors.description ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            />
            {errors.description && (
              <span className="text-xs text-red-500">
                {errors.description.message}
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
              placeholder="Rua das Tesouras, 123"
              {...register("address")}
              className={
                errors.address
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }
            />
            {errors.address && (
              <span className="text-xs text-red-500">
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
              placeholder="(00) 00000-0000"
              {...register("phone")}
              className={
                errors.phone ? "border-red-500 focus-visible:ring-red-500" : ""
              }
            />
            {errors.phone && (
              <span className="text-xs text-red-500">
                {errors.phone.message}
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
              "Lançar Barbearia 🚀"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

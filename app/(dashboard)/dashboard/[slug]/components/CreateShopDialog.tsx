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
import { Loader2, PlusCircle, Crown } from "lucide-react"
import { toast } from "sonner"
import { ImageUpload } from "@/app/components/ImageUpload"
import { Textarea } from "@/app/components/ui/textarea"
import { createBarbershop } from "@/app/actions/barber-actions"
import { useSession } from "next-auth/react"

// 1. DEFINIÇÃO DO SCHEMA (Isso resolve o erro ts(2304))
const formSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  address: z.string().min(5, "Endereço obrigatório"),
  phone: z.string().min(10, "Telefone inválido"),
  description: z.string().min(10, "Descrição muito curta (min 10 letras)"),
  imageUrl: z.string().min(1, "A imagem da fachada é obrigatória"),
})

type FormValues = z.infer<typeof formSchema>

interface CreateShopDialogProps {
  shopCount: number
  isPro: boolean
}

export function CreateShopDialog({ shopCount, isPro }: CreateShopDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { update } = useSession()

  // 2. LÓGICA DE BLOQUEIO PRO
  const isLimitReached = !isPro && shopCount >= 1

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      description: "",
      imageUrl: "",
    },
  })

  const imageUrl = watch("imageUrl")

  const onSubmit = async (data: FormValues) => {
    if (isLimitReached) {
      toast.error("Limite atingido", {
        description: "Assine o plano PRO para gerenciar múltiplas unidades.",
      })
      return
    }

    try {
      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("address", data.address)
      formData.append("phone", data.phone)
      formData.append("description", data.description)
      formData.append("imageUrl", data.imageUrl)

      const result = await createBarbershop(formData)

      if (result?.error) {
        toast.error(result.error)
        return
      }

      if (result?.success) {
        toast.success("Barbearia criada com sucesso!")
        await update()
        setIsOpen(false)
        reset()
        router.push(`/dashboard/${result.slug}`)
        router.refresh()
      }
    } catch (error) {
      console.error(error)
      toast.error("Erro inesperado ao criar barbearia.")
    }
  }

  const handleOpenChange = (open: boolean) => {
    // Intercepta a abertura para fazer marketing do PRO
    if (isLimitReached && open) {
      toast("🚀 Evolua para o Plano PRO!", {
        description:
          "Você atingiu o limite de 1 unidade gratuita. Desbloqueie filiais ilimitadas agora.",
        action: {
          label: "Ver Planos",
          onClick: () => router.push("/dashboard/billing"),
        },
      })
      return
    }
    if (!open) reset()
    setIsOpen(open)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant={isLimitReached ? "secondary" : "default"}
          className="w-full gap-2 sm:w-auto"
        >
          {isLimitReached ? (
            <>
              <Crown size={16} className="text-yellow-500" />
              Upgrade para Multi-filiais
            </>
          ) : (
            <>
              <PlusCircle size={16} />
              Nova Filial
            </>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[95%] rounded-2xl sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Unidade</DialogTitle>
          <DialogDescription>
            Cadastre os detalhes da sua nova filial para começar os
            agendamentos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {/* IMAGEM */}
          <div className="space-y-2">
            <Label>Logotipo / Fachada</Label>
            <ImageUpload
              value={imageUrl}
              onChange={(url) => setValue("imageUrl", url)}
            />
            {errors.imageUrl && (
              <p className="text-xs text-red-500">{errors.imageUrl.message}</p>
            )}
          </div>

          {/* NOME */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Barbearia</Label>
            <Input
              id="name"
              placeholder="Ex: Dom Bigode - Centro"
              {...register("name")}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* DESCRIÇÃO */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Conte um pouco sobre esta unidade..."
              {...register("description")}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-xs text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* ENDEREÇO E TELEFONE EM GRID NO DESKTOP */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                placeholder="Rua, Número, Bairro"
                {...register("address")}
                className={errors.address ? "border-red-500" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">WhatsApp</Label>
              <Input
                id="phone"
                placeholder="(00) 00000-0000"
                {...register("phone")}
                className={errors.phone ? "border-red-500" : ""}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-6 text-base font-bold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              "Lançar Unidade 🚀"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

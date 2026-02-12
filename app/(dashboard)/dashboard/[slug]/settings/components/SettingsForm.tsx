"use client"

import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Textarea } from "@/app/components/ui/textarea"
import { Label } from "@/app/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card"
import { Loader2, Save } from "lucide-react"
import { ShopImageUpload } from "./shop-image-upload"
import { updateShopSettings } from "@/app/actions/barber-actions"
import { useState } from "react"
import { toast } from "sonner"
import { Prisma } from "@prisma/client"

interface SettingsFormProps {
  shop: Prisma.BarberShopGetPayload<{}>
}

export function SettingsForm({ shop }: SettingsFormProps) {
  const [isPending, setIsPending] = useState(false)

  // Wrapper para lidar com o envio e mostrar Toast
  const handleSubmit = async (formData: FormData) => {
    setIsPending(true)
    try {
      await updateShopSettings(formData)
      toast.success("Informações salvas com sucesso!")
    } catch (error) {
      toast.error("Erro ao atualizar configurações.")
      console.error(error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Dados Gerais</CardTitle>
          <CardDescription>
            Essas informações aparecem na sua página de agendamento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Usamos 'action={handleSubmit}' para interceptar e dar feedback */}
          <form action={handleSubmit} className="space-y-4">
            <input type="hidden" name="shopId" value={shop.id} />

            <div className="grid gap-2">
              <Label htmlFor="name">Nome da Barbearia</Label>
              <Input
                id="name"
                name="name"
                defaultValue={shop.name}
                required
                minLength={3}
                placeholder="Ex: Corte Elite"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Endereço Completo</Label>
              <Input
                id="address"
                name="address"
                defaultValue={shop.address}
                required
                minLength={5}
                placeholder="Rua Exemplo, 123, Bairro..."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Telefone / WhatsApp</Label>
              <Input
                id="phone"
                name="phone"
                // Pega o primeiro telefone ou string vazia
                defaultValue={shop.phones?.[0] || ""}
                required
                placeholder="(83) 99999-9999"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descrição / Bio</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={shop.description || ""}
                className="min-h-[100px]"
                placeholder="Conte um pouco sobre sua barbearia..."
              />
            </div>

            <div className="grid gap-2">
              <Label>Imagem de Capa</Label>
              {/* Seu componente de Upload reutilizado */}
              <ShopImageUpload defaultImage={shop.imageUrl} />
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                className="w-full font-bold md:w-auto"
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar Alterações
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

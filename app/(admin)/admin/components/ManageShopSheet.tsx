"use client"

import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/app/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select"
import { BarberShopPlan } from "@prisma/client"
import { updateBarbershop } from "@/app/actions/admin-actions"
import { useState } from "react"
import { Badge } from "@/app/components/ui/badge"
import { toast } from "sonner"

interface ManageShopSheetProps {
  shop: {
    id: string
    name: string
    plan: BarberShopPlan
    subscriptionEndsAt: Date | null
    stripeSubscriptionStatus: boolean | null
  }
}

export function ManageShopSheet({ shop }: ManageShopSheetProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSave = async (formData: FormData) => {
    try {
      await updateBarbershop(formData)
      setIsOpen(false)
      toast.success("Barbearia atualizada com sucesso!")
    } catch (error) {
      toast.error("Erro ao atualizar.")
    }
  }

  // Define o valor padrão do status com base no banco
  const defaultStatus = shop.stripeSubscriptionStatus ? "true" : "false"

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Badge variant="outline" className="hover:bg-muted cursor-pointer">
          Gerenciar
        </Badge>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Gerenciar: {shop.name}</SheetTitle>
          <SheetDescription>Alterações manuais de assinatura.</SheetDescription>
        </SheetHeader>

        <form action={handleSave} className="grid gap-4 py-4">
          <input type="hidden" name="shopId" value={shop.id} />

          {/* STATUS: Agora envia "true" ou "false" explicitamente */}
          <div
            className={`grid gap-2 rounded-md border p-3 ${shop.stripeSubscriptionStatus ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
          >
            <Label
              htmlFor="status"
              className={
                shop.stripeSubscriptionStatus
                  ? "text-green-700"
                  : "text-red-700"
              }
            >
              Status do Acesso
            </Label>
            <Select name="status" defaultValue={defaultStatus}>
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">✅ Ativo (Liberado)</SelectItem>
                <SelectItem value="false">🚫 Inativo (Bloqueado)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="plan">Plano Atual</Label>
            <Select name="plan" defaultValue={shop.plan}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="START">Start</SelectItem>
                <SelectItem value="PRO">PRO</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="daysToAdd">Adicionar Dias (Cortesía)</Label>
            <Input
              id="daysToAdd"
              name="daysToAdd"
              type="number"
              placeholder="0"
              defaultValue={0}
            />
            <p className="text-muted-foreground text-xs">
              Vence em:{" "}
              {shop.subscriptionEndsAt
                ? new Date(shop.subscriptionEndsAt).toLocaleDateString()
                : "Sem data"}
            </p>
          </div>

          <Button type="submit" className="mt-4 w-full">
            Salvar Alterações
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}

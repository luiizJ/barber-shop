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
    await updateBarbershop(formData)
    setIsOpen(false)
    toast.success("Barbearia atualizada com sucesso!")
  }

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
          <SheetDescription>
            Faça alterações manuais na assinatura e status.
          </SheetDescription>
        </SheetHeader>

        <form action={handleSave} className="grid gap-4 py-4">
          <input type="hidden" name="shopId" value={shop.id} />

          {/* 👇 1. NOVO: Status da Conta (O BAN HAMMER 🔨) */}
          <div className="grid gap-2 rounded-md border border-red-200 bg-red-50 p-3 dark:bg-red-950/20">
            <Label htmlFor="status" className="font-bold text-red-600">
              Status do Acesso
            </Label>
            {/* O name="status" aqui precisa bater com o admin-actions.ts */}
            <Select
              name="status"
              defaultValue={shop.stripeSubscriptionStatus ? "true" : "false"}
            >
              <SelectTrigger className="border-red-200 bg-white dark:bg-zinc-950">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">✅ Ativo (Liberado)</SelectItem>
                <SelectItem value="inactive">🚫 Inativo (Bloqueado)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[10px] font-medium text-red-500">
              Atenção: "Inativo" bloqueia o acesso do barbeiro imediatamente.
            </p>
          </div>

          {/* 2. Mudar Plano */}
          <div className="grid gap-2">
            <Label htmlFor="plan">Plano Atual</Label>
            <Select name="plan" defaultValue={shop.plan}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="START">Start (Grátis/Básico)</SelectItem>
                <SelectItem value="PRO">PRO (Pago)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 3. Adicionar Dias (Cortesía) */}
          <div className="grid gap-2">
            <Label htmlFor="daysToAdd">
              Adicionar Dias de Acesso (Cortesía)
            </Label>
            <Input
              id="daysToAdd"
              name="daysToAdd"
              type="number"
              placeholder="Ex: 30 para dar um mês"
            />
            <p className="text-muted-foreground text-xs">
              Vencimento atual:{" "}
              {shop.subscriptionEndsAt
                ? new Date(shop.subscriptionEndsAt).toLocaleDateString()
                : "Sem data"}
            </p>
          </div>

          <Button type="submit" className="mt-4">
            Salvar Alterações
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}

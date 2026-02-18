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
import { updateBarbershop, deleteBarbershop } from "@/app/actions/admin-actions"
import { useState } from "react"
import { Badge } from "@/app/components/ui/badge"
import { toast } from "sonner"
import { Trash2, ShieldCheck, ShieldAlert } from "lucide-react"

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

// 1. Interface Atualizada para o novo Schema
interface ManageShopSheetProps {
  shop: {
    id: string
    name: string
    plan: BarberShopPlan
    subscriptionEndsAt: Date | null
    owner: {
      stripeSubscriptionStatus: string | null // ✅ Agora no owner e como String
    } | null
  }
}

export function ManageShopSheet({ shop }: ManageShopSheetProps) {
  const [isOpen, setIsOpen] = useState(false)

  // 2. Lógica de Status (Verifica se é "active")
  const isActive = shop.owner?.stripeSubscriptionStatus === "active"

  // O valor que vai para o Select (mantendo compatibilidade com sua lógica de salvar)
  const defaultStatusValue = shop.owner?.stripeSubscriptionStatus || "inactive"

  const handleSave = async (formData: FormData) => {
    try {
      await updateBarbershop(formData)
      setIsOpen(false)
      toast.success("Barbearia atualizada com sucesso!")
    } catch (error) {
      toast.error("Erro ao atualizar.")
    }
  }

  const handleDelete = async () => {
    try {
      const formData = new FormData()
      formData.append("shopId", shop.id)
      await deleteBarbershop(formData)
      setIsOpen(false)
      toast.success("Barbearia deletada com sucesso!")
    } catch (error) {
      toast.error("Erro ao deletar barbearia.")
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Badge variant="outline" className="hover:bg-muted cursor-pointer">
          Gerenciar
        </Badge>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Gerenciar: {shop.name}</SheetTitle>
          <SheetDescription>
            Alterações manuais na assinatura do dono e status da unidade.
          </SheetDescription>
        </SheetHeader>

        <form action={handleSave} className="grid gap-4 py-4">
          <input type="hidden" name="shopId" value={shop.id} />

          {/* STATUS DO ACESSO (Visual melhorado) */}
          <div
            className={`grid gap-2 rounded-md border p-3 ${
              isActive
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <Label
              htmlFor="status"
              className={`flex items-center gap-2 ${isActive ? "text-green-700" : "text-red-700"}`}
            >
              {isActive ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
              Status da Assinatura (Dono)
            </Label>

            <Select name="status" defaultValue={defaultStatusValue}>
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">✅ Ativo (Total)</SelectItem>
                <SelectItem value="past_due">⏳ Pendente (Aviso)</SelectItem>
                <SelectItem value="canceled">
                  🚫 Cancelado (Bloqueio)
                </SelectItem>
                <SelectItem value="inactive">🌑 Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* PLANO */}
          <div className="grid gap-2">
            <Label htmlFor="plan">Plano da Unidade</Label>
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

          {/* VENCIMENTO */}
          <div className="grid gap-2">
            <Label htmlFor="daysToAdd">Adicionar Dias de Cortesia</Label>
            <Input
              id="daysToAdd"
              name="daysToAdd"
              type="number"
              placeholder="Ex: 30"
              defaultValue={0}
            />
            <p className="text-muted-foreground text-xs italic">
              Vencimento atual:{" "}
              {shop.subscriptionEndsAt
                ? new Date(shop.subscriptionEndsAt).toLocaleDateString("pt-BR")
                : "Sem data definida"}
            </p>
          </div>

          <Button type="submit" className="mt-2 w-full">
            Salvar Alterações
          </Button>
        </form>

        {/* ZONA DE PERIGO */}
        <div className="mt-8 border-t pt-6">
          <h3 className="mb-2 text-sm font-bold text-red-600">
            Zona de Perigo
          </h3>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full gap-2">
                <Trash2 size={16} /> Excluir Barbearia
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                <AlertDialogDescription>
                  Essa ação excluirá permanentemente a unidade
                  <strong> {shop.name}</strong> e todos os seus dados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Sim, Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SheetContent>
    </Sheet>
  )
}

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
import { updateBarbershop, deleteBarbershop } from "@/app/actions/admin-actions" // 👈 Importe a nova action
import { useState } from "react"
import { Badge } from "@/app/components/ui/badge"
import { toast } from "sonner"
import { Trash2 } from "lucide-react" // 👈 Ícone de lixo

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

  // Função para deletar
  const handleDelete = async () => {
    try {
      const formData = new FormData()
      formData.append("shopId", shop.id)
      await deleteBarbershop(formData)
      setIsOpen(false) // Fecha o Sheet
      toast.success("Barbearia deletada com sucesso!")
    } catch (error) {
      toast.error("Erro ao deletar barbearia.")
    }
  }

  const defaultStatus = shop.stripeSubscriptionStatus ? "true" : "false"

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Badge variant="outline" className="hover:bg-muted cursor-pointer">
          Gerenciar
        </Badge>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        {" "}
        {/* Scroll se precisar */}
        <SheetHeader>
          <SheetTitle>Gerenciar: {shop.name}</SheetTitle>
          <SheetDescription>
            Faça alterações manuais na assinatura e status.
          </SheetDescription>
        </SheetHeader>
        <form action={handleSave} className="grid gap-4 py-4">
          <input type="hidden" name="shopId" value={shop.id} />

          {/* ... (Seus campos de Status, Plano e Dias continuam IGUAIS aqui) ... */}
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

          <Button type="submit" className="mt-2 w-full">
            Salvar Alterações
          </Button>
        </form>
        {/* 👇 ZONA DE PERIGO (DELETE) */}
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
                  Essa ação não pode ser desfeita. Isso excluirá permanentemente
                  a barbearia
                  <strong> {shop.name}</strong> e todos os seus agendamentos,
                  serviços e dados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Sim, Excluir Definitivamente
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SheetContent>
    </Sheet>
  )
}

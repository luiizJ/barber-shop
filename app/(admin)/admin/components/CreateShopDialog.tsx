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
import { createManualBarbershop } from "@/app/actions/admin-actions"
import { useState } from "react"
import { PlusCircle } from "lucide-react"

export function CreateShopDialog() {
  const [isOpen, setIsOpen] = useState(false)

  const handleCreate = async (formData: FormData) => {
    try {
      await createManualBarbershop(formData)
      setIsOpen(false)
      alert("Barbearia criada!")
    } catch (error) {
      alert("Erro: Verifique se o email do usuário existe.")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Barbearia
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastrar Barbearia Manualmente</DialogTitle>
          <DialogDescription>
            Crie uma loja para um usuário que JÁ existe no sistema.
          </DialogDescription>
        </DialogHeader>

        <form action={handleCreate} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome da Barbearia</Label>
            <Input
              id="name"
              name="name"
              placeholder="Ex: Cortes do Zé"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email do Dono (Já cadastrado)</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="cliente@gmail.com"
              required
            />
          </div>

          <Button type="submit">Criar e Vincular</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

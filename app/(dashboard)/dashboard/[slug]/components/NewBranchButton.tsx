"use client"

import { Button } from "@/app/components/ui/button"
import { Lock, PlusCircle } from "lucide-react"
import Link from "next/link"
import { CreateShopDialog } from "./CreateShopDialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip"

interface NewBranchButtonProps {
  userShopsCount: number
  isPro: boolean
}

export function NewBranchButton({
  userShopsCount,
  isPro,
}: NewBranchButtonProps) {
  // Lógica do Limite: Se não for PRO e já tiver 1 loja (ou mais), bloqueia.
  // Se for PRO, o limite é maior (ex: 5 ou 99), então liberamos.
  const isBlocked = !isPro && userShopsCount >= 1

  if (isBlocked) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/dashboard/subscription">
              <Button
                variant="outline"
                className="text-muted-foreground gap-2 border-yellow-500/50 hover:bg-yellow-500/10 hover:text-yellow-600"
              >
                <Lock size={16} className="text-yellow-600" />
                Nova Filial
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>Disponível apenas no plano PRO. Clique para fazer upgrade.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Se não estiver bloqueado, mostra o Modal de criação normal
  // O botão de "Criar" já está dentro desse componente
  return <CreateShopDialog />
}

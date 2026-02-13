"use client"

import { useState, useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select"
import { useRouter, useSearchParams } from "next/navigation"

export function DashboardDateFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Pega o valor atual da URL ou padroniza como "today"
  const currentRange = searchParams.get("range") || "today"

  // 👇 ESTADO PARA CONTROLAR A MONTAGEM (FIX DO ERRO)
  const [isMounted, setIsMounted] = useState(false)

  // O useEffect só roda no navegador. Assim que rodar, avisamos que está montado.
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleValueChange = (value: string) => {
    // Atualiza a URL sem recarregar a página inteira
    router.push(`/dashboard?range=${value}`)
  }

  // 👇 SE AINDA NÃO MONTOU, RETORNA UM "ESPAÇO VAZIO" (SKELETON)
  // Isso evita que o servidor renderize o Select com IDs errados.
  if (!isMounted) {
    return <div className="h-10 w-[180px] rounded-md bg-zinc-800/10" />
  }

  // 👇 AGORA RENDERIZA SEGURO NO CLIENTE
  return (
    <Select value={currentRange} onValueChange={handleValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Selecione o período" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="today">Hoje</SelectItem>
        <SelectItem value="yesterday">Ontem</SelectItem>
        <SelectItem value="month">Este Mês</SelectItem>
      </SelectContent>
    </Select>
  )
}

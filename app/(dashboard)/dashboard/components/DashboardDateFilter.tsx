"use client"

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

  const handleValueChange = (value: string) => {
    // Atualiza a URL sem recarregar a página inteira (Server Component vai revalidar)
    router.push(`/dashboard?range=${value}`)
  }

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

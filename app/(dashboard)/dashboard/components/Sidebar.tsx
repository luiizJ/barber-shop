"use client"

import { Button } from "@/app/components/ui/button"
import {
  Calendar,
  CreditCard,
  Home,
  LogOut,
  Scissors,
  Settings,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import { signOut } from "next-auth/react"

interface SidebarProps {
  shopName: string
  shopImage: string
}

export function Sidebar({ shopName, shopImage }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path ? "secondary" : "ghost"
  }

  return (
    <div className="bg-card fixed top-0 left-0 flex h-screen w-64 flex-col border-r">
      {/* 1. CABEÇALHO DA LOJA */}
      <div className="flex items-center gap-3 border-b p-6">
        <Avatar>
          <AvatarImage src={shopImage} />
          <AvatarFallback>{shopName[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <h1 className="w-32 truncate text-sm font-bold">{shopName}</h1>
          <span className="text-muted-foreground text-xs">Painel Admin</span>
        </div>
      </div>

      {/* 2. MENU DE NAVEGAÇÃO */}
      <div className="flex-1 space-y-2 px-3 py-6">
        <Button
          variant={isActive("/dashboard")}
          className="w-full justify-start gap-2"
          asChild
        >
          <Link href="/dashboard">
            <Home className="h-4 w-4" /> Início
          </Link>
        </Button>

        <Button
          variant={isActive("/dashboard/services")}
          className="w-full justify-start gap-2"
          asChild
        >
          <Link href="/dashboard/services">
            <Scissors className="h-4 w-4" /> Serviços
          </Link>
        </Button>

        <Button
          variant={isActive("/dashboard/calendar")}
          className="w-full justify-start gap-2"
          asChild
        >
          <Link href="/dashboard/calendar">
            <Calendar className="h-4 w-4" /> Agenda
          </Link>
        </Button>

        <Button
          variant={isActive("/dashboard/settings")}
          className="w-full justify-start gap-2"
          asChild
        >
          <Link href="/dashboard/settings">
            <Settings className="h-4 w-4" /> Configurações
          </Link>
        </Button>

        <Button
          variant={isActive("/dashboard/subscription")}
          className="w-full justify-start gap-2 text-blue-600"
          asChild
        >
          <Link href="/dashboard/subscription">
            <CreditCard className="h-4 w-4" /> Assinatura
          </Link>
        </Button>
      </div>

      {/* 3. RODAPÉ (LOGOUT) */}
      <div className="border-t p-4">
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4" /> Sair
        </Button>
      </div>
    </div>
  )
}

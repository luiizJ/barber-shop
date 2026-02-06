"use client"

import { Button } from "@/app/components/ui/button"
import {
  Calendar,
  CreditCard,
  Home,
  LogOut,
  Menu,
  Scissors,
  Settings,
} from "lucide-react"
import Link from "next/link"
// 1. Importe o hook usePathname
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import { signOut } from "next-auth/react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/app/components/ui/sheet"

interface SidebarProps {
  shopName: string
  shopImage: string
}

export function Sidebar({ shopName, shopImage }: SidebarProps) {
  // 2. Pegue a rota atual
  const pathname = usePathname()

  // 3. Lógica: Se a rota tiver "/settings" (ou config), ESCONDE o botão
  // Ajuste a string abaixo conforme a URL real da sua página de configurações
  const isSettingsPage =
    pathname.includes("/settings") ||
    pathname.includes("/configuracoes") ||
    pathname.includes("/subscription")

  return (
    <>
      {/* --- VERSÃO MOBILE (Botão Hambúrguer) --- */}
      <div className="md:hidden">
        {/* 4. Renderização Condicional: Só mostra o Sheet se NÃO for a página de settings */}
        {!isSettingsPage && (
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="fixed top-4 right-4 z-50"
              >
                <Menu size={20} />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Menu de Navegação</SheetTitle>
              </SheetHeader>

              <SidebarContent shopName={shopName} shopImage={shopImage} />
            </SheetContent>
          </Sheet>
        )}
      </div>

      {/* --- VERSÃO DESKTOP (Fixa lateral) --- */}
      {/* No Desktop mantemos sempre visível, pois não atrapalha */}
      <div className="bg-card fixed top-0 left-0 hidden h-screen w-64 flex-col border-r md:flex">
        <SidebarContent shopName={shopName} shopImage={shopImage} />
      </div>
    </>
  )
}

// ... (O SidebarContent continua igualzinho lá embaixo) ...
function SidebarContent({ shopName, shopImage }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path ? "secondary" : "ghost"
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b p-6">
        <Avatar>
          <AvatarImage src={shopImage} />
          <AvatarFallback>{shopName ? shopName[0] : "B"}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <h1 className="w-40 truncate text-sm font-bold">{shopName}</h1>
          <span className="text-muted-foreground text-xs">Painel Admin</span>
        </div>
      </div>

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

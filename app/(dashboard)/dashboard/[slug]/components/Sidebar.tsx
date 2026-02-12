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
  ChevronsUpDown,
  Store,
  LayoutDashboard, // 👈 Importado novo ícone
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import { signOut } from "next-auth/react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/app/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu"
import { Separator } from "@/app/components/ui/separator" // 👈 Importado Separator (opcional, se não tiver use div border)

interface SidebarProps {
  shops: {
    id: string
    name: string
    imageUrl: string
    slug: string
  }[]
  currentShop?: any
}

export function Sidebar({ shops, currentShop }: SidebarProps) {
  const pathname = usePathname()
  // Esconde o menu mobile em páginas de settings se preferir, ou mantém.
  const isSettingsPage =
    pathname.includes("/settings") || pathname.includes("/subscription")

  return (
    <>
      {/* --- MOBILE --- */}
      <div className="md:hidden">
        {!isSettingsPage && (
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="bg-background/80 fixed top-4 right-4 z-50 backdrop-blur-sm"
              >
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <SidebarContent shops={shops} currentShop={currentShop} />
            </SheetContent>
          </Sheet>
        )}
      </div>

      {/* --- DESKTOP --- */}
      <div className="bg-card fixed top-0 left-0 hidden h-screen w-64 flex-col border-r md:flex">
        <SidebarContent shops={shops} currentShop={currentShop} />
      </div>
    </>
  )
}

function SidebarContent({ shops, currentShop }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  // Verifica se estamos na raiz (Holding)
  const isRootDashboard = pathname === "/dashboard"

  const isActive = (path: string) => {
    if (path === `/dashboard/${currentShop?.slug}`) {
      return pathname === path ? "secondary" : "ghost"
    }
    return pathname.includes(path) ? "secondary" : "ghost"
  }

  const handleShopChange = (newSlug: string) => {
    router.push(`/dashboard/${newSlug}`)
  }

  const getLink = (subPath: string) => {
    const slug = currentShop?.slug || shops[0]?.slug
    return `/dashboard/${slug}${subPath}`
  }

  return (
    <div className="flex h-full flex-col">
      {/* 1. HEADER DA SIDEBAR (Seletor de Loja) */}
      <div className="border-b p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-auto w-full justify-between px-3 py-2"
            >
              <div className="flex items-center gap-3 overflow-hidden text-left">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={currentShop?.imageUrl || shops[0]?.imageUrl}
                  />
                  <AvatarFallback className="rounded-lg">
                    {(currentShop?.name || shops[0]?.name)?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col truncate">
                  <span className="truncate text-sm font-bold">
                    {currentShop?.name || shops[0]?.name}
                  </span>
                  <span className="text-muted-foreground text-[10px] tracking-wider uppercase">
                    Trocar unidade
                  </span>
                </div>
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start" side="bottom">
            <DropdownMenuLabel>Minhas Barbearias</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {shops.map((shop) => (
              <DropdownMenuItem
                key={shop.id}
                className="flex cursor-pointer items-center gap-2"
                onClick={() => handleShopChange(shop.slug)}
              >
                <Store className="h-4 w-4" />
                <span className="flex-1 truncate">{shop.name}</span>
                {shop.id === currentShop?.id && (
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 2. ÁREA DE LINKS */}
      <div className="flex-1 space-y-1 px-3 py-4">
        {/* 👇 NOVO: BOTÃO VISÃO GERAL (HOLDING) */}
        <Button
          variant={isRootDashboard ? "secondary" : "ghost"}
          className="mb-2 w-full justify-start gap-2"
          asChild
        >
          <Link href="/dashboard">
            <LayoutDashboard className="h-4 w-4" />
            Visão Geral
          </Link>
        </Button>

        {/* Separador Visual entre Holding e Loja */}
        <div className="my-2 px-4 pb-1">
          <Separator className="bg-zinc-800" />
          <p className="text-muted-foreground mt-2 text-[10px] font-medium tracking-wider uppercase">
            Menu da Loja
          </p>
        </div>

        {/* LINKS DA LOJA ESPECÍFICA */}
        <Button
          variant={isActive(`/dashboard/${currentShop?.slug}`)}
          className="w-full justify-start gap-2"
          asChild
        >
          <Link href={getLink("")}>
            <Home className="h-4 w-4" /> Início
          </Link>
        </Button>

        <Button
          variant={isActive("/services")}
          className="w-full justify-start gap-2"
          asChild
        >
          <Link href={getLink("/services")}>
            <Scissors className="h-4 w-4" /> Serviços
          </Link>
        </Button>

        <Button
          variant={isActive("/calendar")}
          className="w-full justify-start gap-2"
          asChild
        >
          <Link href={getLink("/calendar")}>
            <Calendar className="h-4 w-4" /> Agenda
          </Link>
        </Button>

        <Button
          variant={isActive("/settings")}
          className="w-full justify-start gap-2"
          asChild
        >
          <Link href={getLink("/settings")}>
            <Settings className="h-4 w-4" /> Configurações
          </Link>
        </Button>

        <Button
          variant={isActive("/subscription")}
          className="w-full justify-start gap-2 font-medium text-blue-600"
          asChild
        >
          <Link href={getLink("/subscription")}>
            <CreditCard className="h-4 w-4" /> Assinatura
          </Link>
        </Button>
      </div>

      {/* 3. FOOTER (LOGOUT) */}
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

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
  const isSettingsPage =
    pathname.includes("/settings") || pathname.includes("/subscription")

  return (
    <>
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

      <div className="bg-card fixed top-0 left-0 hidden h-screen w-64 flex-col border-r md:flex">
        <SidebarContent shops={shops} currentShop={currentShop} />
      </div>
    </>
  )
}

function SidebarContent({ shops, currentShop }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  //  Lógica de active corrigida para rotas dinâmicas
  const isActive = (path: string) => {
    // Se o path for apenas o dashboard da loja
    if (path === `/dashboard/${currentShop?.slug}`) {
      return pathname === path ? "secondary" : "ghost"
    }
    // Para subpáginas (services, calendar, etc)
    return pathname.includes(path) ? "secondary" : "ghost"
  }

  //  1. Função para trocar de loja (Muda a rota inteira)
  const handleShopChange = (newSlug: string) => {
    // Se você mudar de loja, ele te joga para a home daquela loja
    router.push(`/dashboard/${newSlug}`)
  }

  //  2. Função para construir links dinâmicos
  // Agora o link vira: /dashboard/nome-da-loja/servicos
  const getLink = (subPath: string) => {
    const slug = currentShop?.slug || shops[0]?.slug
    return `/dashboard/${slug}${subPath}`
  }

  return (
    <div className="flex h-full flex-col">
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

      <div className="flex-1 space-y-1 px-3 py-4">
        {/* Notar que passamos apenas o final da URL para o getLink */}
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

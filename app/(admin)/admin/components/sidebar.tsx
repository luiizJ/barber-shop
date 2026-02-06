"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  CalendarDays,
  Scissors,
  Settings,
  LogOut,
} from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { signOut } from "next-auth/react"
import { cn } from "@/app/lib/utils"

export const Sidebar = () => {
  const pathname = usePathname()

  const links = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Agendamentos",
      href: "/admin/bookings",
      icon: CalendarDays,
    },
    {
      label: "Serviços",
      href: "/admin/services",
      icon: Scissors,
    },
    {
      label: "Configurações",
      href: "/admin/settings",
      icon: Settings,
    },
  ]

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="text-xl font-bold">Agdlyflow</span>
          <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">
            Admin
          </span>
        </Link>
      </div>

      <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
        {links.map((link) => {
          const isActive = pathname === link.href

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                isActive ? "bg-muted text-primary" : "text-muted-foreground",
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto p-4">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  )
}

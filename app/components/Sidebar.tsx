"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import {
  CalendarIcon,
  HomeIcon,
  LogInIcon,
  LogOutIcon,
  LayoutDashboard,
  Scissors,
  MenuIcon,
} from "lucide-react"
import { Button } from "./ui/button"
//
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet"
import { Avatar, AvatarImage } from "./ui/avatar"
import Link from "next/link"
import { searchCategory } from "../constants/searchCategory"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"

interface SidebarProps {
  hasBarbershop?: boolean
}

const Sidebar = ({ hasBarbershop }: SidebarProps) => {
  const { data: session } = useSession()

  const handleLoginWithGoogle = async () => {
    await signIn("google")
  }
  const handleLogoutClick = () => {
    signOut()
  }

  const isOwner = session?.user && hasBarbershop

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline">
          <MenuIcon size={18} />
        </Button>
      </SheetTrigger>

      <SheetContent className="overflow-y-auto p-3 [&::-webkit-scrollbar]:hidden">
        <SheetHeader className="pb-0 text-left">
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>

        {/* --- CABEÇALHO (LOGIN OU PERFIL) --- */}
        <div className="flex items-center justify-between gap-3 border-b border-solid p-1 pb-5">
          {session?.user ? (
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage
                  src={session?.user.image ?? ""}
                  alt="Avatar"
                  width={48}
                  height={48}
                />
              </Avatar>
              <div className="flex flex-col">
                <span className="font-bold">{session?.user.name}</span>
                <span className="text-xs">{session?.user.email}</span>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold">Faça seu login</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size={"icon"}>
                    <LogInIcon size={18} />
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[70%]">
                  <DialogHeader>
                    <DialogTitle>Faça seu login</DialogTitle>
                    <DialogDescription>
                      Conecte-se usando sua conta Google
                    </DialogDescription>
                  </DialogHeader>
                  <Button
                    className="text-[15px] font-bold"
                    onClick={handleLoginWithGoogle}
                  >
                    <Image
                      src={"/googleIcon.svg"}
                      alt={"fazer login com google"}
                      width={17}
                      height={17}
                    />
                    Google
                  </Button>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>

        {/* --- BOTÕES DE NAVEGAÇÃO --- */}
        <div className="flex flex-col gap-2 border-b border-solid py-5">
          <SheetClose asChild>
            <Button className="justify-start gap-2" variant={"ghost"} asChild>
              <Link href="/">
                <HomeIcon size={18} />
                Início
              </Link>
            </Button>
          </SheetClose>

          {session?.user && (
            <SheetClose asChild>
              <Button className="justify-start gap-2" variant={"ghost"} asChild>
                <Link href="/bookings">
                  <CalendarIcon size={18} />
                  Agendamentos
                </Link>
              </Button>
            </SheetClose>
          )}

          <SheetClose asChild>
            <Button className="justify-start gap-2" variant={"ghost"} asChild>
              <Link href={isOwner ? "/dashboard" : "/pricing"}>
                {isOwner ? (
                  <LayoutDashboard size={18} />
                ) : (
                  <Scissors size={18} />
                )}
                {isOwner ? "Minha Barbearia" : "Anuncie sua barbearia"}
              </Link>
            </Button>
          </SheetClose>
        </div>

        {/* --- CATEGORIAS (SOMENTE PARA LOGADOS) --- */}
        {session?.user && (
          <div className="flex flex-col gap-2 py-5">
            {searchCategory.map((services) => (
              <SheetClose key={services.id} asChild>
                <Button
                  className="justify-start gap-2"
                  variant={"ghost"}
                  asChild
                >
                  <Link href={`/barbershops?search=${services.title}`}>
                    <Image
                      src={services.imageUrl}
                      alt={services.title}
                      width={18}
                      height={18}
                    />
                    {services.title}
                  </Link>
                </Button>
              </SheetClose>
            ))}
          </div>
        )}

        {session?.user && (
          <div className="flex flex-col gap-2 border-t border-solid p-5">
            <Button className="gap-2" onClick={handleLogoutClick}>
              <LogOutIcon size={18} />
              Sair da conta
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default Sidebar

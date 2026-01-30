"use client"
import { signIn, signOut, useSession } from "next-auth/react"
import {
  CalendarIcon,
  HomeIcon,
  LogInIcon,
  LogOutIcon,
  MenuIcon,
} from "lucide-react"
import { Button } from "./ui/button"
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

const Sidebar = () => {
  const { data: session } = useSession()
  const handleLoginWithGoogle = async () => {
    await signIn("google")
  }
  const handleLogoutClick = () => {
    signOut()
  }

  return (
    <SheetContent className="overflow-y-auto p-3 [&::-webkit-scrollbar]:hidden">
      <SheetHeader className="pb-0 text-left">
        <SheetTitle className="text-left">Menu</SheetTitle>
      </SheetHeader>

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
            <h2 className="text-lg font-bold">Faça Seu Login</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button size={"icon"}>
                  <LogInIcon size={18} />
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[70%]">
                <DialogHeader>
                  <DialogTitle>Faça Seu Login</DialogTitle>
                  <DialogDescription>
                    Conecte-se Usando Sua Conta Google
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

      <div className="flex flex-col gap-2 border-b border-solid">
        <SheetClose asChild>
          <Button className="justify-start gap-2" variant={"ghost"} asChild>
            <Link href="/">
              <HomeIcon size={18} />
              Inicio
            </Link>
          </Button>
        </SheetClose>
        <Button className="mb-4 justify-start gap-2" variant={"ghost"} asChild>
          <Link href="/Agendamentos">
            <CalendarIcon size={18} />
            Agendamentos
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {searchCategory.map((services) => (
          <Button
            className="justify-start gap-2"
            variant={"ghost"}
            key={services.id}
            asChild
          >
            <Link href="/">
              <Image
                src={services.imageUrl}
                alt={services.title}
                width={18}
                height={18}
              />
              {services.title}
            </Link>
          </Button>
        ))}
      </div>

      {session?.user && (
        <div className="flex flex-col gap-2 border-t border-solid p-5">
          <Button className="gap-2" onClick={handleLogoutClick}>
            <LogOutIcon size={18} />
            Sair da conta
          </Button>
        </div>
      )}
    </SheetContent>
  )
}

export default Sidebar

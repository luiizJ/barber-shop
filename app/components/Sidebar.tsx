import { CalendarIcon, HomeIcon, LogOutIcon, MenuIcon } from "lucide-react"
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

const Sidebar = () => {
  return (
    <SheetContent className="overflow-y-auto p-3 [&::-webkit-scrollbar]:hidden">
      <SheetHeader className="pb-0 text-left">
        <SheetTitle className="text-left">Menu</SheetTitle>
      </SheetHeader>

      <div className="flex items-center gap-3 border-b border-solid p-2 pb-5">
        <Avatar>
          <AvatarImage src="/img2.png" alt="Avatar" width={48} height={48} />
        </Avatar>
        <div className="flex flex-col">
          <span className="font-bold">Luizin Dugrau</span>
          <span className="text-xs">@luizindugrau155@hotmail.com</span>
        </div>
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

      <div className="flex flex-col gap-2 border-t border-solid p-5">
        <Button className="gap-2">
          <LogOutIcon size={18} />
          Sair da conta
        </Button>
      </div>
    </SheetContent>
  )
}

export default Sidebar

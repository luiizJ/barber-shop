import { CalendarIcon, HomeIcon, LogOutIcon, MenuIcon } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import Link from "next/link"
import Image from "next/image"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet"
import { searchCategory } from "../constants/searchCategory"
import { Avatar } from "./ui/avatar"
import { AvatarImage } from "@radix-ui/react-avatar"

const Header = async () => {
  return (
    <header>
      <Card className="">
        <CardContent className="flex flex-row items-center justify-between p-3">
          <Link href="/">
            <Image
              alt="Agenda barber"
              src="/img0.png"
              height={18}
              width={120}
            />
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline">
                <MenuIcon />
              </Button>
            </SheetTrigger>

            <SheetContent className="overflow-y-auto [&::-webkit-scrollbar]:hidden">
              <SheetHeader className="py-5 text-left">
                <SheetTitle className="left">Menu</SheetTitle>
              </SheetHeader>

              <div className="flex items-center gap-3 border-b border-solid p-3">
                <Avatar>
                  <AvatarImage
                    src="/img2.png"
                    alt="Avatar"
                    width={48}
                    height={48}
                  />
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-bold">Luizin Dugrau</span>
                  <span className="text-xs">@luizindugrau155@hotmail.com</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 border-b border-solid py-2">
                <SheetClose asChild>
                  <Button
                    className="justify-start gap-2"
                    variant={"ghost"}
                    asChild
                  >
                    <Link href="/">
                      <HomeIcon size={18} />
                      Inicio
                    </Link>
                  </Button>
                </SheetClose>
                <Button
                  className="justify-start gap-2"
                  variant={"ghost"}
                  asChild
                >
                  <Link href="/Agendamentos">
                    <CalendarIcon size={18} />
                    Agendamentos
                  </Link>
                </Button>
              </div>

              <div className="flex flex-col gap-2 p-5">
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

              <div className="flex flex-col gap-2 border-t border-solid p-3">
                <Button className="gap-2">
                  <LogOutIcon size={18} />
                  Sair da conta
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </CardContent>
      </Card>
    </header>
  )
}

export default Header

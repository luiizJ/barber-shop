import { Card, CardContent } from "./ui/card"
import Link from "next/link"
import Image from "next/image"
import Sidebar from "./Sidebar"
import { MenuIcon, Sheet } from "lucide-react"
import { SheetTrigger } from "./ui/sheet"
import { Button } from "./ui/button"

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
            <Sidebar />
          </Sheet>
        </CardContent>
      </Card>
    </header>
  )
}

export default Header

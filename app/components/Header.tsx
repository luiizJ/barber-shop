import { MenuIcon } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import Link from "next/link"
import Image from "next/image"
import { Sheet, SheetTrigger } from "./ui/sheet"

const Header = async () => {
  return (
    <header>
      <Card>
        <CardContent className="flex flex-row items-center justify-between p-5">
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
          </Sheet>
        </CardContent>
      </Card>
    </header>
  )
}

export default Header

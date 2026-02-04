import { Card, CardContent } from "./ui/card"
import Link from "next/link"
import Image from "next/image"
import Sidebar from "./Sidebar"
import { MenuIcon, Scissors } from "lucide-react"
import { Sheet, SheetTrigger } from "./ui/sheet"
import { Button } from "./ui/button"

const Header = async () => {
  return (
    <header>
      <Card className="">
        <CardContent className="flex flex-row items-center justify-between p-3">
          <Button asChild className="bg-transparent">
            <Link href="/">
              {/* <Image
              alt="Agenda barber"
              src="/img0.png"
              height={18}
              width={120}
            /> */}
              <div className="flex items-center gap-2">
                <div className="bg-primary shadow-primary/20 flex h-8 w-8 items-center justify-center rounded-lg shadow-lg">
                  <Scissors className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-extrabold tracking-tighter">
                  <span className="bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Agdly
                  </span>
                  <span className="text-primary italic">flow</span>
                </h1>
              </div>
            </Link>
          </Button>

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

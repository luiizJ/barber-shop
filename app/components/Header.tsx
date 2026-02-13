import { Card, CardContent } from "./ui/card"
import Link from "next/link"
import Sidebar from "./Sidebar"
import { Scissors } from "lucide-react"
import { Button } from "./ui/button"
import { getBarbershopOwnerState } from "../data/get-barbershop-owner-stat"

const Header = async () => {
  const hasBarbershop = await getBarbershopOwnerState()
  return (
    <header>
      <Card>
        <CardContent className="flex flex-row items-center justify-between p-3">
          <Button asChild className="bg-transparent" variant={"ghost"}>
            <Link href="/">
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

          {/* 5. Passar a informação para a Sidebar 👇 */}
          <Sidebar hasBarbershop={hasBarbershop} />
        </CardContent>
      </Card>
    </header>
  )
}

export default Header

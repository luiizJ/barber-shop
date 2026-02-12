import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/app/components/ui/button"
import { Separator } from "@/app/components/ui/separator"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getSettingsData } from "./actions/get-settings-data"
import { SettingsForm } from "./components/SettingsForm"

export default async function SettingsPage() {
  // 1. Auth Check
  const session = await getServerSession(authOptions)
  if (!session?.user) return redirect("/")

  // 2. Fetch Data
  const shop = await getSettingsData(session.user.id)

  if (!shop) return redirect("/dashboard")

  // 3. Render
  return (
    <div className="animate-in fade-in space-y-6 duration-500">
      {/* Header com botão de voltar */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="outline" size="icon">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie as informações da sua barbearia.
          </p>
        </div>
      </div>

      <Separator />

      {/* Componente do Formulário */}
      <SettingsForm shop={shop} />
    </div>
  )
}

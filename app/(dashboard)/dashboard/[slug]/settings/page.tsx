import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/app/components/ui/button"
import { Separator } from "@/app/components/ui/separator"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getSettingsData } from "./actions/get-settings-data"
import { SettingsForm } from "./components/SettingsForm"

// 👇 1. Adicionamos a tipagem para receber o slug da URL
interface SettingsPageProps {
  params: Promise<{ slug: string }>
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  // 1. Auth Check
  const session = await getServerSession(authOptions)
  if (!session?.user) return redirect("/")

  //  2. Extraímos o slug
  const { slug } = await params

  //  3. Passamos o slug para a função de busca
  const shop = await getSettingsData(session.user.id, slug)

  // Se não achar a loja com esse slug, volta pro dashboard
  if (!shop) return redirect("/dashboard")

  // 3. Render
  return (
    <div className="animate-in fade-in space-y-6 duration-500">
      {/* Header com botão de voltar */}
      <div className="flex items-center gap-4">
        {/*  Opcional: O voltar pode ir para o dashboard da loja específica */}
        <Link href={`/dashboard/${slug}`}>
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

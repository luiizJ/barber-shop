import { db } from "@/app/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Textarea } from "@/app/components/ui/textarea"
import { Label } from "@/app/components/ui/label"
import { updateShopSettings } from "@/app/actions/barber-actions"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card"
import { Separator } from "@/app/components/ui/separator"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { ShopImageUpload } from "./components/shop-image-upload"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return redirect("/")

  // Busca os dados atuais da loja
  const shop = await db.barberShop.findFirst({
    where: { ownerId: session.user.id },
  })

  // Se não tiver loja, chuta pro dashboard (que vai pedir pra criar)
  if (!shop) return redirect("/dashboard")

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

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados Gerais</CardTitle>
            <CardDescription>
              Essas informações aparecem na sua página de agendamento.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* O FORMULÁRIO CHAMA A ACTION DIRETO */}
            <form action={updateShopSettings} className="space-y-4">
              <input type="hidden" name="shopId" value={shop.id} />

              <div className="grid gap-2">
                <Label htmlFor="name">Nome da Barbearia</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={shop.name}
                  required
                  minLength={3}
                  placeholder="Ex: Corte Elite"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">Endereço Completo</Label>
                <Input
                  id="address"
                  name="address"
                  defaultValue={shop.address}
                  required
                  minLength={5}
                  placeholder="Rua Exemplo, 123, Bairro..."
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Telefone / WhatsApp</Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={shop.phones[0]}
                  required
                  placeholder="(83) 99999-9999"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Descrição / Bio</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={shop.description}
                  className="min-h-[100px]"
                  placeholder="Conte um pouco sobre sua barbearia..."
                />
              </div>

              <div className="grid gap-2">
                <Label>Imagem de Capa</Label>
                <ShopImageUpload defaultImage={shop.imageUrl} />
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" className="w-full font-bold md:w-auto">
                  <Save className="mr-2 h-4 w-4" /> Salvar Alterações
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "./components/sidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  // Dupla checagem de segurança (Backup do Middleware)
  if (!session?.user) {
    redirect("/")
  }

  // Opcional: Se quiser ser muito restritivo, checa o role aqui também
  // if (session.user.role === 'USER') redirect("/")

  return (
    <div className="bg-muted/40 flex min-h-screen w-full flex-col lg:flex-row">
      {/* Sidebar Lateral (Menu) */}
      <aside className="hidden w-64 border-r bg-white lg:block dark:bg-zinc-950">
        <Sidebar />
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
    </div>
  )
}

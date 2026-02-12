import { CreateShopDialog } from "../[slug]/components/CreateShopDialog"

interface DashboardEmptyStateProps {
  userName?: string | null
}

export function DashboardEmptyState({ userName }: DashboardEmptyStateProps) {
  return (
    <div className="animate-in fade-in flex h-[80vh] w-full flex-col items-center justify-center gap-6 text-center duration-700">
      <div className="space-y-2">
        <h1 className="text-foreground text-3xl font-bold tracking-tighter sm:text-4xl">
          Bem-vindo, {userName?.split(" ")[0]}! ✂️
        </h1>
        <p className="text-muted-foreground max-w-[600px] md:text-xl">
          Sua conta foi criada. Cadastre sua primeira unidade/seu perfil para
          começar.
        </p>
      </div>
      <CreateShopDialog />
    </div>
  )
}

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { redirect } from "next/navigation"
import { getServicesData } from "./actions/get-services-data"
import ServicesList from "./components/ServicesList"

interface ServicesPageProps {
  params: Promise<{ slug: string }>
}

export default async function ServicesPage({ params }: ServicesPageProps) {
  // 1. Auth Check
  const session = await getServerSession(authOptions)
  if (!session?.user) return redirect("/")

  // 👇 2. Extraímos o slug da URL
  const { slug } = await params

  //  3. Passamos o slug junto com o ID do usuário
  const data = await getServicesData(session.user.id, slug)

  if (!data) return redirect("/dashboard")

  // 3. Render
  return (
    <div className="animate-in fade-in duration-500">
      {/* 👇 Importante: Precisamos passar o ID da loja para o componente de lista/criação 
         para que o formulário saiba onde salvar o serviço novo.
      */}
      <ServicesList
        services={data.services}
        plan={data.plan}
        shopId={data.shopId}
      />
    </div>
  )
}

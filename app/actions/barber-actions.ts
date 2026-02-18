"use server"

import { db } from "@/app/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getPlanLimits } from "@/app/lib/plan-limits"
import { addDays, isSameMonth } from "date-fns"
import { redirect } from "next/navigation"

// --- 1. SCHEMAS DE VALIDAÇÃO (ZOD) ---

const serviceSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "O nome deve ter pelo menos 2 letras").max(50),
  description: z.string().max(200, "Descrição muito longa").optional(),
  price: z.coerce.number().min(0, "O preço não pode ser negativo"),
  imageUrl: z.string().optional().or(z.literal("")),
})

// --- 2. AÇÃO PRINCIPAL: CRIAR OU EDITAR SERVIÇO (UPSERT) ---
export async function upsertService(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Não autorizado.")

  //  1. PEGAMOS O ID DA LOJA QUE O FRONT-END ENVIOU
  const barberShopId = formData.get("barberShopId") as string

  // Se for criação e não tiver ID da loja, é um erro.
  // Se for edição, as vezes o ID vem, as vezes confiamos no ID do serviço.
  const serviceId = formData.get("id") as string

  // 2. BUSCA A LOJA ESPECÍFICA (A correção mágica)
  const shop = await db.barberShop.findFirst({
    where: {
      // Se veio o ID da loja no form, usamos ele.
      // Se não, tentamos achar a loja através do dono (fallback para evitar crash, mas o certo é vir o ID)
      id: barberShopId,
      ownerId: session.user.id, // Garante segurança (tem que ser dono dessa loja específica)
    },
    select: {
      id: true,
      plan: true,
      lastMenuUpdatedAt: true,
      _count: { select: { services: true } },
    },
  })

  if (!shop)
    throw new Error("Barbearia não encontrada ou você não tem permissão.")

  // LIMPEZA DOS DADOS
  const rawData = {
    id: serviceId || undefined,
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    price: Number(formData.get("price")),
    imageUrl: (formData.get("imageUrl") as string) || "",
  }

  // Parse do Zod (assumindo que você tem o serviceSchema importado)
  // const data = serviceSchema.parse(rawData)
  // Vou usar rawData direto pra simplificar caso o schema não esteja no contexto,
  // mas mantenha sua validação Zod se tiver!
  const data = rawData

  const limits = getPlanLimits(shop.plan)

  // REGRA A: Limite de Quantidade (Só aplica se for CRIAÇÃO)
  if (!data.id) {
    if (shop._count.services >= limits.maxServices) {
      throw new Error(
        `Seu plano ${shop.plan} permite apenas ${limits.maxServices} serviços. Faça Upgrade!`,
      )
    }
  }

  // REGRA B: Limite de Atualização de Preço
  if (data.id && shop.plan === "START") {
    const oldService = await db.barberServices.findUnique({
      where: { id: data.id },
    })

    if (oldService && Number(oldService.price) !== data.price) {
      const now = new Date()

      // Verifica se existe lastMenuUpdatedAt e se é no mesmo mês
      if (
        shop.lastMenuUpdatedAt &&
        shop.lastMenuUpdatedAt.getMonth() === now.getMonth() &&
        shop.lastMenuUpdatedAt.getFullYear() === now.getFullYear()
      ) {
        throw new Error(
          "No plano START, você só pode alterar preços 1x por mês. Aguarde o próximo mês ou vire PRO.",
        )
      }
    }
  }

  if (data.id) {
    // ATUALIZAR
    await db.barberServices.update({
      where: { id: data.id }, // O ID é único globalmente, não precisa do shopId no where
      data: {
        name: data.name,
        description: data.description || "",
        price: data.price,
        imageUrl: data.imageUrl || "",
      },
    })
  } else {
    // CRIAR
    await db.barberServices.create({
      data: {
        name: data.name,
        description: data.description || "",
        price: data.price,
        imageUrl: data.imageUrl || "https://placehold.co/400",

        //  3. GARANTINDO QUE VAI PRA LOJA CERTA
        barberShopId: shop.id,
      },
    })
  }

  // Atualiza data do menu
  await db.barberShop.update({
    where: { id: shop.id },
    data: { lastMenuUpdatedAt: new Date() },
  })

  // Revalidar caminhos
  revalidatePath("/dashboard/[slug]/services")
  revalidatePath("/dashboard")
}
// --- 3. AÇÃO DE DELETAR SERVIÇO ---
export async function deleteService(serviceId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { error: "Não autorizado" }

  try {
    // 1. Validação de segurança (Dono/Admin)
    const service = await db.barberServices.findUnique({
      where: { id: serviceId },
      select: {
        barberShop: { select: { ownerId: true } },
      },
    })

    if (!service) return { error: "Serviço não encontrado." }

    const isOwner = service.barberShop.ownerId === (session.user as any).id
    const isAdmin = (session.user as any).role === "ADMIN"
    if (!isOwner && !isAdmin) return { error: "Não autorizado." }

    // 2. Trava de Segurança: Não deixa apagar se houver agendamento CONFIRMADO (futuro)
    // Isso evita apagar um serviço que tem um cliente esperando hoje ou amanhã.
    const activeBookings = await db.booking.count({
      where: {
        serviceId,
        status: "CONFIRMED",
      },
    })

    if (activeBookings > 0) {
      return {
        error: "Este serviço possui agendamentos ativos!",
        description:
          "Cancele os agendamentos confirmados antes de excluir o serviço definitivamente.",
      }
    }

    // 3. EXCLUSÃO TOTAL (Cascata Manual)
    // Usamos uma transação para garantir que ou apaga tudo ou não apaga nada
    await db.$transaction([
      // Passo A: Apaga TODOS os agendamentos vinculados (Cancelados, Finalizados, etc)
      db.booking.deleteMany({
        where: { serviceId },
      }),
      // Passo B: Agora que não existe mais nenhum vínculo no banco, apaga o serviço
      db.barberServices.delete({
        where: { id: serviceId },
      }),
    ])

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("ERRO_DELETE_SERVICE:", error)
    return { error: "Erro ao excluir o serviço e seu histórico." }
  }
}

// --- 4. AÇÃO DE CRIAR BARBEARIA (ONBOARDING) ---

export async function createBarbershop(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { error: "Faça login primeiro.", success: false }

  // 🔍 BUSCA DIRETA NO BANCO: Evita erro de sessão desatualizada
  // 1. BUSCA O USUÁRIO + PRIMEIRA LOJA (Para herdar a data)
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      ownedBarbershops: {
        take: 1,
        orderBy: { createdAt: "asc" }, // Pegamos a loja mais antiga como referência
      },
    },
  })
  // 2. Verifica se ele tem alguma barbearia com plano PRO ativo

  const userShopsCount = await db.barberShop.count({
    where: { ownerId: session.user.id },
  })
  const status = user?.stripeSubscriptionStatus?.trim().toLowerCase()

  const isPro = user?.role === "ADMIN" || status === "active"
  const limit = isPro ? 5 : 1

  if (userShopsCount >= limit) {
    console.log(
      `❌ Bloqueado: User é ${isPro ? "PRO" : "START"}. Lojas: ${userShopsCount}/${limit}`,
    )
    return {
      error: `Limite atingido! No plano ${isPro ? "PRO" : "Gratuito"}, o limite é ${limit}.`,
      success: false,
    }
  }

  // Preparação dos dados
  const rawData = {
    name: formData.get("name"),
    address: formData.get("address"),
    phone: formData.get("phone"),
    description: formData.get("description"),
    imageUrl: (formData.get("imageUrl") as string) || "",
  }

  const createShopSchema = z.object({
    name: z.string().min(3, "Nome deve ter no mínimo 3 letras"),
    address: z.string().min(5, "Endereço muito curto"),
    description: z
      .string()
      .min(10, "A descrição deve ter pelo menos 10 caracteres"),
    phone: z.string().min(10, "Telefone inválido"),
    imageUrl: z.string().optional().or(z.literal("")),
  })

  const result = createShopSchema.safeParse(rawData)

  if (!result.success) {
    const errorMessage = result.error.issues[0].message
    console.log("❌ Erro de Validação Zod:", errorMessage)
    return { error: errorMessage, success: false }
  }

  const data = result.data

  // Gera Slug
  const slug =
    data.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "") +
    "-" +
    Math.floor(Math.random() * 1000)

  // 2. TRANSAÇÃO
  try {
    await db.$transaction(async (tx) => {
      // 2. DEFINIÇÃO DA HERANÇA
      // Se ele é PRO, a nova loja herda a validade da primeira loja.
      // Se não é PRO, ela ganha os 15 dias de teste.
      const primaryShop = user?.ownedBarbershops[0]
      const planToSet = isPro ? "PRO" : "START"
      const subscriptionDate =
        isPro && primaryShop?.subscriptionEndsAt
          ? primaryShop.subscriptionEndsAt
          : null
      const trialDate = isPro ? null : addDays(new Date(), 15)
      // A. Cria a Barbearia
      const shop = await tx.barberShop.create({
        data: {
          name: data.name,
          address: data.address,
          phones: [data.phone as string],
          slug: slug,
          description: data.description,
          imageUrl:
            data.imageUrl ||
            "https://utfs.io/f/5832df58-cfd7-4b3f-b102-42b7e150ced2-16r.png",
          ownerId: session.user.id,
          plan: planToSet,
          subscriptionEndsAt: subscriptionDate,
          trialEndsAt: trialDate,
        },
      })
      console.log("✅ Barbearia criada:", shop.id)

      // B. Promove Usuário
      if (session.user.role === "USER") {
        await tx.user.update({
          where: { id: session.user.id },
          data: { role: "BARBER_OWNER" },
        })
      }

      // C. Cria Barbeiro
      await tx.barber.create({
        data: {
          name: session.user.name || "Barbeiro Principal",
          barberShopId: shop.id,
          commissionRate: 100,
          imageUrl: session.user.image,
        },
      })

      // D. Cria Serviços
      const DEFAULT_SERVICES = [
        {
          name: "Corte de Cabelo",
          description: "Estilo personalizado.",
          price: 35.0,
          imageUrl:
            "https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png",
        },
        {
          name: "Barba Completa",
          description: "Modelagem com navalha.",
          price: 25.0,
          imageUrl:
            "https://images.unsplash.com/photo-1532710093739-9470acff878f?q=80&w=800&auto=format&fit=crop",
        },
        {
          name: "Pezinho / Acabamento",
          description: "Limpeza do pescoço.",
          price: 15.0,
          imageUrl:
            "https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png",
        },
      ]

      await tx.barberServices.createMany({
        data: DEFAULT_SERVICES.map((service) => ({
          name: service.name,
          description: service.description,
          price: service.price,
          imageUrl: service.imageUrl,
          barberShopId: shop.id,
        })),
      })
    })

    revalidatePath("/dashboard")
    console.log("🎉 Sucesso total!")

    // 👇 MUDANÇA IMPORTANTE: Retornamos sucesso em vez de redirecionar
    return { success: true, slug: slug }
  } catch (error) {
    console.error("❌ ERRO CRÍTICO NO BANCO:", error)
    return {
      error: "Erro interno ao criar barbearia. Verifique o terminal.",
      success: false,
    }
  }
}
// --- 5. AÇÃO DE ATUALIZAR CONFIGURAÇÕES DA LOJA (USADA NA PÁGINA SETTINGS) ---
export async function updateShopSettings(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Não autorizado.")

  // 1. Pega os dados do formulário
  const rawData = {
    id: formData.get("shopId") as string,
    name: formData.get("name") as string,
    address: formData.get("address") as string,
    description: formData.get("description") as string,
    imageUrl: formData.get("imageUrl") as string,
    phones: [formData.get("phone") as string], // Transforma em Array para o Prisma
  }

  // 2. SEGURANÇA: Garante que o usuário é o DONO da loja que está tentando editar
  const shop = await db.barberShop.findUnique({
    where: { id: rawData.id },
  })

  if (!shop) throw new Error("Barbearia não encontrada.")

  // Apenas o Dono (OwnerId) ou o Admin (Você) podem editar os dados visuais
  if (shop.ownerId !== session.user.id && session.user.role !== "ADMIN") {
    throw new Error("Você não tem permissão para editar esta barbearia.")
  }

  // 3. Atualiza no Banco de Dados
  await db.barberShop.update({
    where: { id: rawData.id },
    data: {
      name: rawData.name,
      address: rawData.address,
      description: rawData.description,
      imageUrl: rawData.imageUrl,
      phones: rawData.phones,
    },
  })

  // 4. Atualiza os caches para o usuário ver a mudança na hora
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/settings")
  revalidatePath(`/barbershops/${shop.slug}`) // Atualiza a página pública também
}

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

  const isOwner = session.user.role === "BARBER_OWNER"
  const isAdmin = session.user.role === "ADMIN"

  if (!isOwner && !isAdmin) {
    throw new Error("Acesso negado. Apenas donos podem gerenciar serviços.")
  }

  // LIMPEZA DOS DADOS
  const rawData = {
    id: formData.get("id") ? (formData.get("id") as string) : undefined,
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    price: Number(formData.get("price")),
    imageUrl: (formData.get("imageUrl") as string) || "",
  }

  const data = serviceSchema.parse(rawData)

  const shop = await db.barberShop.findFirst({
    where: { ownerId: session.user.id },
    select: {
      id: true,
      plan: true,
      lastMenuUpdatedAt: true,
      _count: { select: { services: true } },
    },
  })

  if (!shop) throw new Error("Barbearia não encontrada.")

  const limits = getPlanLimits(shop.plan)

  // REGRA A: Limite de Quantidade
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

      if (shop.lastMenuUpdatedAt && isSameMonth(shop.lastMenuUpdatedAt, now)) {
        throw new Error(
          "No plano START, você só pode alterar preços 1x por mês. Aguarde o próximo mês ou vire PRO.",
        )
      }
    }
  }

  if (data.id) {
    // ATUALIZAR
    await db.barberServices.update({
      where: { id: data.id, barberShopId: shop.id },
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
        barberShopId: shop.id,
      },
    })
  }

  await db.barberShop.update({
    where: { id: shop.id },
    data: { lastMenuUpdatedAt: new Date() },
  })

  revalidatePath("/dashboard/services")
}

// --- 3. AÇÃO DE DELETAR SERVIÇO ---
export async function deleteService(serviceId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return

  const shop = await db.barberShop.findFirst({
    where: { ownerId: session.user.id },
  })

  if (!shop) return

  await db.barberServices.delete({
    where: {
      id: serviceId,
      barberShopId: shop.id,
    },
  })

  revalidatePath("/dashboard/services")
}

// --- 4. AÇÃO DE CRIAR BARBEARIA (ONBOARDING) ---
export async function createBarbershop(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Faça login primeiro.")

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

  // Valida os dados (agora inclui imageUrl)
  const data = createShopSchema.parse(rawData)

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

  // 1. Cria a Barbearia
  const shop = await db.barberShop.create({
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
      plan: "START",
      stripeSubscriptionStatus: true,
      trialEndsAt: addDays(new Date(), 15),
    },
  })

  // 2. Promove Usuário para DONO
  if (session.user.role === "USER") {
    await db.user.update({
      where: { id: session.user.id },
      data: { role: "BARBER_OWNER" },
    })
  }

  // 3. Cria o Dono como o Primeiro Barbeiro
  await db.barber.create({
    data: {
      name: session.user.name || "Barbeiro Principal",
      barberShopId: shop.id,
      commissionRate: 100,
      imageUrl: session.user.image,
    },
  })
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
  // 4. CRIA OS SERVIÇOS PADRÃO
  await db.barberServices.createMany({
    data: DEFAULT_SERVICES.map((service) => ({
      name: service.name,
      description: service.description,
      price: service.price,
      imageUrl: service.imageUrl,
      barberShopId: shop.id,
    })),
  })

  revalidatePath("/dashboard")
  redirect("/dashboard")
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

"use server"

import { db } from "@/app/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getPlanLimits } from "@/app/lib/plan-limits"
import { isSameMonth } from "date-fns"

// --- 1. SCHEMAS DE VALIDAÇÃO (ZOD) ---

const serviceSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "O nome deve ter pelo menos 2 letras").max(50),
  description: z.string().max(200, "Descrição muito longa").optional(),
  price: z.coerce.number().min(0, "O preço não pode ser negativo"),
  imageUrl: z.string().optional().or(z.literal("")),
})

// Schema para criar a loja (CORRIGIDO 👇)
const createShopSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 letras"),
  address: z.string().min(5, "Endereço muito curto"),
  phone: z.string().min(10, "Telefone inválido"),
  // ✅ ADICIONADO: Agora o schema aceita a imagem da loja
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

// LISTA DE SERVIÇOS PADRÃO (O "Seed" automático)
const DEFAULT_SERVICES = [
  {
    name: "Corte de Cabelo",
    description: "Estilo personalizado. Inclui lavagem e finalização.",
    price: 35.0,
    imageUrl:
      "https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png",
  },
  {
    name: "Barba Completa",
    description: "Modelagem com navalha, toalha quente e balm hidratante.",
    price: 25.0,
    imageUrl:
      "https://images.unsplash.com/photo-1532710093739-9470acff878f?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Pezinho / Acabamento",
    description: "Manutenção dos contornos e limpeza do pescoço.",
    price: 15.0,
    imageUrl:
      "https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png",
  },
  {
    name: "Corte + Barba",
    description: "Combo completo para renovar o visual.",
    price: 55.0,
    imageUrl:
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1000&auto=format&fit=crop",
  },
  {
    name: "Sobrancelha",
    description: "Limpeza e alinhamento com navalha ou pinça.",
    price: 10.0,
    imageUrl: "https://utfs.io/f/21de4d1f-a6dd-446f-8a8e-b8d21b062545-16u.png",
  },
]

// --- 4. AÇÃO DE CRIAR BARBEARIA (ONBOARDING) ---
export async function createBarbershop(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Faça login primeiro.")

  const rawData = {
    name: formData.get("name"),
    address: formData.get("address"),
    phone: formData.get("phone"),
    imageUrl: (formData.get("imageUrl") as string) || "",
  }

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
      description: "Barbearia criada via Dashboard.",
      imageUrl:
        data.imageUrl ||
        "https://utfs.io/f/c97a2adb-3065-448a-86a4-4320138d356c-16p.png",
      ownerId: session.user.id,
      plan: "START",
      stripeSubscriptionStatus: "active",
    },
  })

  // 2. Promove Usuário para DONO
  if (session.user.role !== "BARBER_OWNER") {
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

  // 4. ✨ MÁGICA NOVA: CRIA OS SERVIÇOS PADRÃO
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
}

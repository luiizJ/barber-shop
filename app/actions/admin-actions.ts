"use server"

import { db } from "@/app/lib/prisma"
import { revalidatePath } from "next/cache"
import { BarberShopPlan } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { z } from "zod"

// --- SCHEMAS DE VALIDAÇÃO---

const updateShopSchema = z.object({
  shopId: z.string().uuid(),
  plan: z.enum(["START", "PRO"]),
  daysToAdd: z.coerce.number().min(0).max(3650),
  status: z.enum(["active", "inactive", "past_due"]), // Trava os status permitidos
})

const createShopSchema = z.object({
  name: z.string().min(3, "Nome muito curto").max(50, "Nome muito longo"),
  email: z.string().email("Email inválido"),
})

// --- FUNÇÕES ---

// Função para Atualizar a Barbearia
export async function updateBarbershop(formData: FormData) {
  //  SEGURANÇA 1: Verificação de Identidade
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Acesso Negado: Tentativa de invasão bloqueada.")
  }

  //  SEGURANÇA 2: Validação e Limpeza dos Dados (Zod)
  const rawData = {
    shopId: formData.get("shopId"),
    plan: formData.get("plan"),
    daysToAdd: formData.get("daysToAdd"),
    status: formData.get("status"),
  }
  // Se os dados forem inválidos, o Zod para tudo aqui.
  const data = updateShopSchema.parse(rawData)

  // --- A partir daqui, usamos 'data' +  seguro ---

  let newEndDate = undefined

  if (data.daysToAdd > 0) {
    const currentEnd = await db.barberShop.findUnique({
      where: { id: data.shopId },
      select: { subscriptionEndsAt: true },
    })

    const baseDate = currentEnd?.subscriptionEndsAt || new Date()
    const resultDate = new Date(baseDate)
    resultDate.setDate(resultDate.getDate() + data.daysToAdd)
    newEndDate = resultDate
  }

  await db.barberShop.update({
    where: { id: data.shopId },
    data: {
      plan: data.plan as BarberShopPlan,
      stripeSubscriptionStatus: data.status,
      ...(newEndDate && { subscriptionEndsAt: newEndDate }),
    },
  })

  revalidatePath("/admin")
}

// Função para Criar Barbearia Manualmente
export async function createManualBarbershop(formData: FormData) {
  //  SEGURANÇA 1: Verificação de Identidade
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Acesso Negado.")
  }

  //  SEGURANÇA 2: Validação (Zod)
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
  }

  const data = createShopSchema.parse(rawData)

  // Gerar Slug
  const slug = data.name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")

  const owner = await db.user.findUnique({ where: { email: data.email } })

  if (!owner) {
    throw new Error("Usuário não encontrado com este e-mail.")
  }

  await db.barberShop.create({
    data: {
      name: data.name,
      slug: slug + "-" + Math.floor(Math.random() * 1000),
      address: "Endereço Pendente",
      description: "Cadastrada pelo Admin",
      imageUrl: "https://placehold.co/600x400.png",
      phones: ["(00) 00000-0000"],
      ownerId: owner.id,
      plan: "START",
      stripeSubscriptionStatus: "active",
    },
  })

  if (owner.role === "USER") {
    await db.user.update({
      where: { id: owner.id },
      data: { role: "BARBER_OWNER" },
    })
  }

  revalidatePath("/admin")
}

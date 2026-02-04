"use server"

import { db } from "@/app/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { z } from "zod"

// --- SCHEMAS DE VALIDAÇÃO ---

const updateShopSchema = z.object({
  shopId: z.string().uuid(),
  plan: z.enum(["START", "PRO"]),
  // 👇 1. MUDANÇA: Agora aceita números negativos (pra você remover dias)
  daysToAdd: z.coerce.number().min(-3650).max(3650),

  // Tratamento do booleano (já corrigido antes)
  status: z.preprocess((val) => val === "true" || val === "on", z.boolean()),
})

const createShopSchema = z.object({
  name: z.string().min(3, "Nome muito curto").max(50, "Nome muito longo"),
  email: z.string().email("Email inválido"),
})

// --- FUNÇÕES ---

export async function updateBarbershop(formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Acesso Negado: Tentativa de invasão bloqueada.")
  }

  const rawData = {
    shopId: formData.get("shopId"),
    plan: formData.get("plan"),
    daysToAdd: formData.get("daysToAdd"),
    status: formData.get("status"),
  }

  const data = updateShopSchema.parse(rawData)

  const shop = await db.barberShop.findUnique({
    where: { id: data.shopId },
    select: { subscriptionEndsAt: true, trialEndsAt: true },
  })

  let updateData: any = {
    plan: data.plan,
    stripeSubscriptionStatus: data.status,
  }

  // 1. PRIMEIRO: Calculamos a nova data (se houver dias para adicionar/remover)
  if (data.daysToAdd !== 0) {
    const now = new Date()
    const currentEnd = shop?.subscriptionEndsAt

    // Se já venceu, base é HOJE. Se tá ativo, base é a data atual do banco.
    const baseDate = currentEnd && currentEnd > now ? currentEnd : now

    const resultDate = new Date(baseDate)
    resultDate.setDate(resultDate.getDate() + data.daysToAdd)

    updateData.subscriptionEndsAt = resultDate
  }
  // Se não mexeu nos dias, mas ativou sem data, dá 30 dias de cortesia
  else if (data.daysToAdd === 0 && data.status === true) {
    if (!shop?.subscriptionEndsAt || shop.subscriptionEndsAt < new Date()) {
      const now = new Date()
      now.setDate(now.getDate() + 30)
      updateData.subscriptionEndsAt = now
    }
  }

  // 2. DEPOIS: O Ban Hammer (Só aplica se NÃO tivermos definido uma data nova acima)
  // Se o status é INATIVO e a gente NÃO tocou na data, aí sim matamos pra 1970.
  // Se você adicionou dias, a data nova vai valer (o updateData.subscriptionEndsAt já existe),
  // mas o 'stripeSubscriptionStatus: false' vai continuar bloqueando o acesso.
  if (data.status === false && data.daysToAdd === 0) {
    updateData.subscriptionEndsAt = new Date("1970-01-01")
    updateData.trialEndsAt = new Date("1970-01-01")
  }

  await db.barberShop.update({
    where: { id: data.shopId },
    data: updateData,
  })

  revalidatePath("/admin")
}

// ... createManualBarbershop continua igual ...
export async function createManualBarbershop(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN")
    throw new Error("Acesso Negado.")
  const rawData = { name: formData.get("name"), email: formData.get("email") }
  const data = createShopSchema.parse(rawData)

  const slug = data.name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
  const owner = await db.user.findUnique({ where: { email: data.email } })

  if (!owner) throw new Error("Usuário não encontrado.")

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
      stripeSubscriptionStatus: true,
      subscriptionEndsAt: new Date(
        new Date().setDate(new Date().getDate() + 30),
      ), // Já cria com 30 dias
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

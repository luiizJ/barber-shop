const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Iniciando o seed do SaaS Multi-tenant...")

  // --------------------------------------------------------------------------
  // 1. LIMPEZA (CLEANUP)
  // --------------------------------------------------------------------------
  await prisma.booking.deleteMany()
  await prisma.barberServices.deleteMany()
  await prisma.barberShop.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.verificationToken.deleteMany()
  await prisma.user.deleteMany()

  console.log("🧹 Banco de dados limpo!")

  // --------------------------------------------------------------------------
  // 2. CRIAR O DONO (BARBER_OWNER)
  // ✅ O STATUS DE ASSINATURA AGORA FICA AQUI NO USUÁRIO
  // --------------------------------------------------------------------------
  const donoUser = await prisma.user.create({
    data: {
      name: "Miguel Barbeiro",
      email: "miguel@barber.com",
      role: "BARBER_OWNER",
      phone: "(83) 99999-9999",
      emailVerified: new Date(),
      image: "https://utfs.io/f/c97a296d-7847-4661-8e29-195f874c5d40-4c4f3.png",
      stripeSubscriptionStatus: "active",
    },
  })

  // --------------------------------------------------------------------------
  // 3. CRIAR A BARBEARIA PRINCIPAL (Vintage Barber)
  // --------------------------------------------------------------------------
  const vintageBarber = await prisma.barberShop.create({
    data: {
      name: "Vintage Barber",
      address: "Rua da Tecnologia, 777 - Cabedelo, PB",
      phones: ["(83) 98888-8888", "(83) 97777-7777"],
      description:
        "A melhor barbearia de Cabedelo. Estilo clássico, gestão moderna.",
      imageUrl:
        "https://utfs.io/f/5832df58-cfd7-4b3f-b102-42b7e150ced2-16r.png",
      slug: "vintage-barber",
      plan: "PRO", // ✅ Definimos o plano como PRO
      subscriptionEndsAt: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1),
      ),
      ownerId: donoUser.id,
    },
  })

  console.log(`💈 Barbearia criada: ${vintageBarber.name}`)

  const servicesData = [
    {
      name: "Corte de Cabelo",
      description: "Estilo personalizado com as últimas tendências.",
      price: 50.0,
      imageUrl:
        "https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png",
    },
    {
      name: "Barba",
      description: "Modelagem completa e toalha quente.",
      price: 40.0,
      imageUrl:
        "https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png",
    },
    {
      name: "Acabamento",
      description: "Acabamento perfeito para um visual renovado.",
      price: 15.0,
      imageUrl:
        "https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png",
    },
  ]

  for (const service of servicesData) {
    await prisma.barberServices.create({
      data: {
        name: service.name,
        description: service.description,
        price: service.price,
        imageUrl: service.imageUrl,
        barberShopId: vintageBarber.id,
      },
    })
  }

  // --------------------------------------------------------------------------
  // 3.1 POPULANDO COM MAIS BARBEARIAS (FILIAIS)
  // --------------------------------------------------------------------------
  const extraShops = [
    {
      name: "Corte & Estilo",
      slug: "corte-e-estilo",
      address: "Av. Epitácio Pessoa, 500 - João Pessoa",
      imageUrl:
        "https://utfs.io/f/45331760-899c-4b4b-910e-e00babb6ed81-16q.png",
      description: "Cortes modernos para quem tem atitude.",
    },
    {
      name: "Machado's Barber",
      slug: "machados-barber",
      address: "Rua do Comércio, 88 - Intermares",
      imageUrl:
        "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=800&auto=format&fit=crop",
      description: "Tradição em navalha e toalha quente.",
    },
  ]

  for (const extra of extraShops) {
    const shop = await prisma.barberShop.create({
      data: {
        name: extra.name,
        address: extra.address,
        phones: ["(83) 99999-0000"],
        description: extra.description,
        imageUrl: extra.imageUrl,
        slug: extra.slug,
        ownerId: donoUser.id,
        plan: "PRO",
      },
    })

    for (const service of servicesData) {
      await prisma.barberServices.create({
        data: {
          name: service.name,
          description: service.description,
          price: service.price,
          imageUrl: service.imageUrl,
          barberShopId: shop.id,
        },
      })
    }
    console.log(`💈 Barbearia Extra Criada: ${shop.name}`)
  }

  // --------------------------------------------------------------------------
  // 5. CRIAR AGENDAMENTOS E USUÁRIO CLIENTE
  // --------------------------------------------------------------------------
  const clienteUser = await prisma.user.create({
    data: {
      name: "Cliente Teste",
      email: "cliente@gmail.com",
      role: "USER",
      image: "https://github.com/shadcn.png",
    },
  })

  const servicoCorte = await prisma.barberServices.findFirst({
    where: { barberShopId: vintageBarber.id },
  })

  if (servicoCorte) {
    const amanha = new Date()
    amanha.setDate(amanha.getDate() + 1)

    await prisma.booking.create({
      data: {
        userId: clienteUser.id,
        barberShopId: vintageBarber.id,
        serviceId: servicoCorte.id,
        date: amanha,
        status: "CONFIRMED",
        price: Number(servicoCorte.price),
        paymentMethod: "PIX",
      },
    })

    console.log("📅 Agendamentos criados com sucesso.")
  }

  console.log("✅ Seed finalizado! O banco está populado corretamente.")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

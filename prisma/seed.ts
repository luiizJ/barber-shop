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
  // --------------------------------------------------------------------------
  const donoUser = await prisma.user.create({
    data: {
      name: "Miguel Barbeiro",
      email: "miguel@barber.com",
      role: "BARBER_OWNER",
      phone: "(83) 99999-9999",
      emailVerified: new Date(),
      image: "https://utfs.io/f/c97a296d-7847-4661-8e29-195f874c5d40-4c4f3.png",
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
      stripeSubscriptionStatus: true,
      subscriptionEndsAt: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1),
      ),
      ownerId: donoUser.id,
    },
  })

  console.log(`💈 Barbearia criada: ${vintageBarber.name}`)

  // Definição dos serviços (Reutilizável)
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
    {
      name: "Sobrancelha",
      description: "Ideal para quem deseja um visual moderno.",
      price: 15.0,
      imageUrl:
        "https://utfs.io/f/2118f76e-89e4-43e6-87c9-8f157500c333-b0ps0b.png",
    },
    {
      name: "Pigmentação",
      description: "Pigmentação perfeita para um visual renovado.",
      price: 15.0,
      imageUrl:
        "https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png",
    },
  ]

  // Criar serviços da Vintage
  for (const service of servicesData) {
    await prisma.barberServices.create({
      data: {
        name: service.name,
        description: service.description,
        price: service.price,
        imageUrl: service.imageUrl,
        barberShop: { connect: { id: vintageBarber.id } },
      },
    })
  }

  // --------------------------------------------------------------------------
  // 3.1 POPULANDO COM MAIS BARBEARIAS (EXTRA)
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
        "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=800&auto=format&fit=crop", // Reutilizando img genérica
      description: "Tradição em navalha e toalha quente.",
    },
    {
      name: "Barber King",
      slug: "barber-king",
      address: "Manaíra Shopping, Loja 42",
      imageUrl:
        "https://images.unsplash.com/photo-1532710093739-9470acff878f?q=80&w=800&auto=format&fit=crop",
      description: "A barbearia premium da região.",
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
        stripeSubscriptionStatus: true,
        ownerId: donoUser.id, // Mesmo dono para facilitar
      },
    })

    // Adiciona os mesmos serviços para as novas lojas
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
    const ontem = new Date()
    ontem.setDate(ontem.getDate() - 1)

    const amanha = new Date()
    amanha.setDate(amanha.getDate() + 1)

    const futuro = new Date()
    futuro.setDate(futuro.getDate() + 5)

    // Agendamento Finalizado (Pago em Dinheiro)
    await prisma.booking.create({
      data: {
        userId: clienteUser.id,
        barberShopId: vintageBarber.id,
        serviceId: servicoCorte.id,
        date: ontem,
        status: "CONFIRMED",
        price: Number(servicoCorte.price),
        paymentMethod: "CASH", // Testando o novo campo
      },
    })

    // Agendamento Confirmado (Pago no PIX)
    await prisma.booking.create({
      data: {
        userId: clienteUser.id,
        barberShopId: vintageBarber.id,
        serviceId: servicoCorte.id,
        date: amanha,
        status: "CONFIRMED",
        price: Number(servicoCorte.price),
        paymentMethod: "PIX", // Testando o novo campo
      },
    })

    // Agendamento Cancelado
    await prisma.booking.create({
      data: {
        userId: clienteUser.id,
        barberShopId: vintageBarber.id,
        serviceId: servicoCorte.id,
        date: futuro,
        status: "CANCELLED",
        price: Number(servicoCorte.price),
        paymentMethod: "CARD",
      },
    })

    console.log("📅 Agendamentos criados com sucesso.")
  }

  console.log("✅ Seed finalizado! O banco está populado com 4 barbearias.")
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

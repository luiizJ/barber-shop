const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Iniciando o seed do SaaS Multi-tenant...")

  // --------------------------------------------------------------------------
  // 1. LIMPEZA (CLEANUP)
  // --------------------------------------------------------------------------
  // Apaga dados antigos. A ordem importa para não quebrar chaves estrangeiras.
  await prisma.booking.deleteMany()
  await prisma.barberServices.deleteMany() // MUDANÇA: Nome da tabela agora é singular (BarberService)
  await prisma.barberShop.deleteMany()
  await prisma.account.deleteMany() // ADICIONADO: Limpa conexões do NextAuth
  await prisma.session.deleteMany() // ADICIONADO: Limpa sessões
  await prisma.verificationToken.deleteMany()
  await prisma.user.deleteMany() // Limpa usuários por último

  console.log("🧹 Banco de dados limpo!")

  // --------------------------------------------------------------------------
  // 2. CRIAR O DONO (BARBER_OWNER)
  // --------------------------------------------------------------------------
  // Precisamos dele antes da barbearia para fazer o vínculo (ownerId)
  const donoUser = await prisma.user.create({
    data: {
      name: "Miguel Barbeiro",
      email: "miguel@barber.com",
      role: "BARBER_OWNER", // Define permissão de acesso ao painel
      phone: "(83) 99999-9999", // Telefone pessoal do dono
      emailVerified: new Date(), // Marca como verificado para facilitar testes
      image: "https://utfs.io/f/c97a296d-7847-4661-8e29-195f874c5d40-4c4f3.png",
    },
  })

  // --------------------------------------------------------------------------
  // 3. CRIAR A BARBEARIA (VINCULADA AO DONO)
  // --------------------------------------------------------------------------
  const vintageBarber = await prisma.barberShop.create({
    data: {
      name: "Vintage Barber",
      address: "Rua da Tecnologia, 777 - Cabedelo, PB",
      phones: ["(83) 98888-8888", "(83) 97777-7777"], // MANTIDO: Array de strings
      description:
        "A melhor barbearia de Cabedelo. Estilo clássico, gestão moderna.",
      imageUrl:
        "https://utfs.io/f/5832df58-cfd7-4b3f-b102-42b7e150ced2-16r.png",
      slug: "vintage-barber",

      // CONFIGURAÇÃO SAAS / STRIPE
      stripeSubscriptionStatus: "active", // (Simulação)
      subscriptionEndsAt: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1),
      ), // Válido por 1 ano

      // VÍNCULO IMPORTANTE
      ownerId: donoUser.id,
    },
  })

  console.log(
    `💈 Barbearia criada: ${vintageBarber.name} (Dono: ${donoUser.name})`,
  )

  // --------------------------------------------------------------------------
  // 4. CRIAR SERVIÇOS
  // --------------------------------------------------------------------------
  const services = [
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
      name: "Acabamento", // Corrigi o typo "Acabameto" que estava no original
      description: "Acabamento perfeito para um visual renovado.",
      price: 15.0,
      imageUrl:
        "https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png",
    },
    {
      name: "Sobrancelha",
      description:
        "Ideal para quem deseja um visual moderno, atraente e preenchimento de falhas.",
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

  // Loop para criar os serviços (Usando barberService no singular)
  for (const service of services) {
    await prisma.barberServices.create({
      // MUDANÇA: barberServices -> barberService
      data: {
        name: service.name,
        description: service.description,
        price: service.price,
        imageUrl: service.imageUrl,
        barberShop: {
          connect: {
            id: vintageBarber.id,
          },
        },
      },
    })
  }

  // --------------------------------------------------------------------------
  // 5. CRIAR AGENDAMENTOS (PARA DASHBOARD)
  // --------------------------------------------------------------------------
  const clienteUser = await prisma.user.create({
    data: {
      name: "Cliente Teste",
      email: "cliente@gmail.com",
      role: "USER",
    },
  })

  // Busca o serviço de corte para usar nos agendamentos
  const servicoCorte = await prisma.barberServices.findFirst({
    // MUDANÇA: barberService
    where: { barberShopId: vintageBarber.id },
  })

  if (servicoCorte) {
    const ontem = new Date()
    ontem.setDate(ontem.getDate() - 1)

    const amanha = new Date()
    amanha.setDate(amanha.getDate() + 1)

    const futuro = new Date()
    futuro.setDate(futuro.getDate() + 5)

    // Agendamento Finalizado
    await prisma.booking.create({
      data: {
        userId: clienteUser.id,
        barberShopId: vintageBarber.id,
        serviceId: servicoCorte.id,
        date: ontem,
        status: "COMPLETED",
      },
    })

    // Agendamento Confirmado
    await prisma.booking.create({
      data: {
        userId: clienteUser.id,
        barberShopId: vintageBarber.id,
        serviceId: servicoCorte.id,
        date: amanha,
        status: "CONFIRMED",
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
      },
    })

    console.log(
      "📅 Agendamentos criados: 1 Concluído, 1 Confirmado, 1 Cancelado.",
    )
  }

  console.log("✅ Seed finalizado com sucesso! O banco está pronto.")
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

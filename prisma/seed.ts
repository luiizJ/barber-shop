const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Iniciando o seed do SaaS Multi-tenant...")

  // 1. Limpeza: Apaga tudo para evitar duplicidade
  await prisma.booking.deleteMany()
  await prisma.barberServices.deleteMany()
  await prisma.barberShop.deleteMany()
  await prisma.user.deleteMany()

  console.log("🧹 Banco de dados limpo!")

  // 2. Criar o Usuário que será o DONO (Para testar o Painel)
  const donoUser = await prisma.user.create({
    data: {
      name: "Miguel Barbeiro",
      email: "miguel@barber.com",
      role: "BARBER_OWNER",
      phone: "(83) 99999-9999",
    },
  })

  // 3. Criar a Barbearia "Showcase" vinculada a esse Dono
  const vintageBarber = await prisma.barberShop.create({
    data: {
      name: "Vintage Barber",
      address: "Rua da Tecnologia, 777 - Cabedelo, PB",
      phone: "(83) 98888-8888",
      description:
        "A melhor barbearia de Cabedelo. Estilo clássico, gestão moderna.",
      imageUrl:
        "https://utfs.io/f/5832df58-cfd7-4b3f-b102-42b7e150ced2-16r.png",
      slug: "vintage-barber", // <--- URL única do SaaS
      subscriptionStatus: "ACTIVE", // <--- Simula cliente pagante
      ownerId: donoUser.id, // <--- Vincula ao dono criado acima
    },
  })

  console.log(
    `💈 Barbearia criada: ${vintageBarber.name} (Dono: ${donoUser.name})`,
  )

  // 4. Criar Serviços
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
        "https://utfs.io/f/45331760-899c-4b4b-910e-e00babb6ed81-16q.png",
    },
    {
      name: "Pezinho",
      description: "Acabamento perfeito para um visual renovado.",
      price: 15.0,
      imageUrl:
        "https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png",
    },
  ]

  for (const service of services) {
    await prisma.barberServices.create({
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

  // 5. Criar Agendamentos (Para popular a Dashboard)
  // Cria um cliente comum para ter agendamentos
  const clienteUser = await prisma.user.create({
    data: {
      name: "Cliente Teste",
      email: "cliente@gmail.com",
      role: "USER",
    },
  })

  // Pega um serviço qualquer (Corte) para usar nos agendamentos

  const servicoCorte = await prisma.barberServices.findFirst({
    where: { barberShopId: vintageBarber.id },
  })

  if (servicoCorte) {
    // Definindo datas relativas (Ontem, Amanhã, Semana que vem)
    const ontem = new Date()
    ontem.setDate(ontem.getDate() - 1)

    const amanha = new Date()
    amanha.setDate(amanha.getDate() + 1)

    const futuro = new Date()
    futuro.setDate(futuro.getDate() + 5)

    // 1. Agendamento Finalizado (Ontem) - DINHEIRO NO BOLSO
    await prisma.booking.create({
      data: {
        userId: clienteUser.id,
        barberShopId: vintageBarber.id,
        serviceId: servicoCorte.id,
        date: ontem,
        status: "COMPLETED",
      },
    })

    // 2. Agendamento Confirmado (Amanhã) - RECEITA FUTURA
    await prisma.booking.create({
      data: {
        userId: clienteUser.id,
        barberShopId: vintageBarber.id,
        serviceId: servicoCorte.id,
        date: amanha,
        status: "CONFIRMED",
      },
    })

    // 3. Agendamento Cancelado (Daqui a 5 dias) - TESTE DE UI (VERMELHO)
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

  console.log(
    "✅ Seed finalizado com sucesso! O banco está pronto para ser populado",
  )
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

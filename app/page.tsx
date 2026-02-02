import Header from "./components/Header"
import BarbershopItem from "./components/BarbershopItem"
import { db } from "./lib/prisma"
import ExclusiveBanner from "./components/ExclusiveBanner"
import SearchbarberShops from "./components/SearchbarberShops"
import BookingItem from "./components/BookingItem"
import { getServerSession } from "next-auth"
import { authOptions } from "./lib/auth"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default async function Home() {
  // 1. Pega a sessão (Pode ser null se não tiver logado)
  const session = await getServerSession(authOptions)
  // 2. Busca barbearias (Isso todo mundo pode ver)
  const barberShops = await db.barberShop.findMany({})
  // 3. Busca Agendamentos (Lógica Condicional / Conditional Fetching) 🧠
  // Se tem sessão -> Busca no banco.
  // Se não tem sessão -> Retorna array vazio [].
  const bookings = session?.user
    ? await db.booking.findMany({
        where: {
          userId: (session.user as any).id,
          date: {
            gte: new Date(),
          },
        },
        include: {
          service: {
            include: { barberShop: true },
          },
        },
        orderBy: {
          date: "asc",
        },
      })
    : []

  return (
    <>
      <Header />
      <div className="p-5">
        <h2 className="text-xl font-bold">
          {/* Lógica ternária pra saudação */}
          Olá, {session?.user
            ? session.user.name?.split(" ")[0]
            : "Bem Vindo"}{" "}
          !
        </h2>

        {/* Data Dinâmica  */}
        <p className="text-sm text-gray-400 capitalize">
          {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>

        {/*Busca / Categoria */}
        <div className="mt-6">
          <SearchbarberShops />
        </div>

        {/*Banner Principal*/}
        <div className="mt-6">
          <ExclusiveBanner />
        </div>

        {/* Agendamentos - Só mostra se tiver algum! */}
        {bookings.length > 0 && (
          <>
            <h2 className="mt-6 mb-3 text-xs font-bold text-gray-400 uppercase">
              Agendamentos
            </h2>
            <div className="flex gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden">
              {bookings.map((booking) => (
                <BookingItem key={booking.id} booking={booking} />
              ))}
            </div>
          </>
        )}

        {/*Recomendados*/}
        <h2 className="mt-6 mb-3 text-xs font-bold text-gray-400 uppercase">
          Recomendados
        </h2>
        <div className="flex gap-4 overflow-auto [&::-webkit-scrollbar]:hidden">
          {barberShops.map((shop) => (
            <BarbershopItem key={shop.id} barberShop={shop} />
          ))}
        </div>

        <h2 className="mt-6 mb-3 text-xs font-bold text-gray-400 uppercase">
          Populares
        </h2>
        <div className="flex gap-4 overflow-auto [&::-webkit-scrollbar]:hidden">
          {barberShops.map((shop) => (
            <BarbershopItem key={shop.id} barberShop={shop} />
          ))}
        </div>
      </div>
    </>
  )
}

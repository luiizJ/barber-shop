import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function proxy(req) {
    // Acessa o token
    const token = req.nextauth.token
    const role = token?.role
    const pathname = req.nextUrl.pathname

    //  1. PROTEÇÃO DO SUPER ADMIN (/admin)
    // Regra: Apenas o ADMIN (eu) passa aqui.
    if (pathname.startsWith("/admin")) {
      if (role !== "ADMIN") {
        // Se for Barbeiro ou User comum, tchau
        return NextResponse.redirect(new URL("/", req.url))
      }
    }

    //  2. (Futuro) PROTEÇÃO DO PAINEL DO BARBEIRO (/dashboard)
    // Regra: Só Barbeiro ou Admin entram.
    if (pathname.startsWith("/dashboard")) {
      if (role !== "BARBER_OWNER" && role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", req.url))
      }
    }

    // Rota /bookings: Já está protegida pelo "authorized" lá embaixo,
    // pois exige apenas estar logado.
  },
  {
    callbacks: {
      // O "Gatekeeper" principal:
      // Retorna true: Deixa o middleware rodar a lógica acima.
      // Retorna false: Redireciona para o Login direto.
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/",
    },
  },
)

export const config = {
  // Lista de rotas que passam pelo porteiro
  matcher: ["/admin/:path*", "/bookings/:path*", "/dashboard/:path*"],
}

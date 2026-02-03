# ✂️ Barber Shop Management System

![Project Banner](https://img.shields.io/badge/Status-Finished-green) ![License](https://img.shields.io/badge/License-MIT-blue) ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

Uma plataforma completa de agendamento e gestão para barbearias, desenvolvida com foco em **Performance**, **Clean Architecture** e **Segurança**.

Este projeto simula um SaaS (Software as a Service) onde usuários podem buscar barbearias, selecionar serviços, visualizar disponibilidade em tempo real e realizar agendamentos integrados com notificações via WhatsApp.

---

## 🚀 Tecnologias & Arsenal Técnico

O projeto foi construído utilizando o que há de mais moderno no ecossistema React/Next.js, focado em **Server-Side Rendering (SSR)** e **Server Actions**.

- **Core:** [Next.js 14](https://nextjs.org/) (App Router), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/), [Shadcn/ui](https://ui.shadcn.com/) (Componentes acessíveis e robustos)
- **Banco de Dados & ORM:** [PostgreSQL](https://www.postgresql.org/) (via NeonDB), [Prisma ORM](https://www.prisma.io/)
- **Autenticação:** [NextAuth.js](https://next-auth.js.org/) (Google OAuth)
- **Validação & Utilitários:** `date-fns` (manipulação temporal), `sonner` (toasts), `lucide-react` (ícones)

---

## 🛡️ Destaques de Arquitetura e Segurança

Este não é apenas um CRUD simples. O sistema implementa padrões de defesa e otimização:

### 1. Segurança (Security by Design)

- **Rate Limiting (Anti-Spam):** Implementação de lógica de _throttling_ no Server-Side para impedir ataques de força bruta ou duplicidade de agendamentos por usuários maliciosos ou falhas de rede.
- **Sanitização de Dados (DTO Pattern):** O Front-end recebe apenas os dados estritamente necessários. Objetos complexos do banco (como `Decimal` do Prisma) são tratados e convertidos antes de chegarem ao cliente, prevenindo vazamento de dados e erros de serialização.
- **Input Validation:** Todas as entradas são validadas estritamente no Back-end via Server Actions.

### 2. Performance & UX

- **React Server Components (RSC):** A maior parte da lógica pesada roda no servidor, entregando HTML pronto e leve para o navegador.
- **Server Actions:** Eliminação de API Routes desnecessárias. O Front-end chama funções do Back-end diretamente, com _Type Safety_ total.
- **Optimistic UI:** Feedback visual instantâneo para o usuário durante interações de reserva.

---

## ✨ Funcionalidades Principais

- ✅ **Busca Inteligente:** Pesquisa de barbearias por nome ou serviço.
- ✅ **Agendamento Real-time:** Cálculo de horários disponíveis baseado nos agendamentos já salvos no banco.
- ✅ **Fluxo de Pagamento Híbrido:** Registro de intenção de pagamento (Pix, Cartão ou Dinheiro).
- ✅ **Integração WhatsApp:** Geração automática de link com mensagem pré-formatada para envio de comprovantes Pix.
- ✅ **Dashboard do Usuário:** Visualização de agendamentos confirmados e histórico de finalizados.
- ✅ **Login Social:** Autenticação segura com Google.

---

## 📂 Estrutura de Pastas (Clean Architecture Simplificada)

- **app/actions:** Server Actions (Lógica de Negócio e Segurança).

- **app/components:** Componentes React (Separados em UI genérica e Componentes de Domínio).

- **app/lib:** Configurações de infraestrutura (Prisma Client, Auth Options).

- **app/utils:** Funções auxiliares puras (Helpers).

- **prisma:** Schema do banco de dados e Seeds.

---

## 🔧 Como rodar o projeto localmente

Siga os passos abaixo para ter a aplicação rodando na sua máquina:

### Pré-requisitos

- Node.js (v18+)
- NPM ou Yarn
- PostgreSQL (Local ou Docker)

### 1. Clone o repositório

```bash
git clone [https://github.com/luiizJ/barber-shop](https://github.com/luiizJ/barber-shop)
cd barber-shop
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as Variáveis de Ambiente

```bash
Crie um arquivo .env na raiz do projeto baseando-se no .env.example (se houver) ou adicione as seguintes chaves:
DATABASE_URL="postgresql://user:password@host:port/db_name"
GOOGLE_CLIENT_ID="seu_google_client_id"
GOOGLE_CLIENT_SECRET="seu_google_client_secret"
NEXTAUTH_SECRET="sua_chave_secreta_nextauth"
```

### 4. Configure o Banco de Dados (Prisma)

```bash
npx prisma generate
npx prisma db push  # Ou npx prisma migrate dev
npx prisma db seed  # Para popular o banco com dados iniciais
```

### 5. Inicie o Servidor

```bash
npm run dev
Acesse http://localhost:3000 no seu navegador.
```

## 🤝 Contato

- **Luiz Janampa Full-stack Developer**

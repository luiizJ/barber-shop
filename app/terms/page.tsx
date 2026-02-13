import { Card, CardContent } from "@/app/components/ui/card"

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-extrabold tracking-tighter italic">
        Termos de Uso{" "}
        <span className="text-primary text-sm font-normal not-italic">
          — Agdly Flow
        </span>
      </h1>

      <div className="text-muted-foreground space-y-8 leading-relaxed">
        <section>
          <h2 className="text-foreground mb-3 text-xl font-bold tracking-widest uppercase">
            1. Objeto do Serviço
          </h2>
          <p>
            O <strong>Agdly Flow</strong> é uma plataforma de tecnologia que
            facilita o agendamento de serviços e a gestão de barbearias. Nós
            **não prestamos serviços de barbearia**. A responsabilidade pela
            execução do serviço, qualidade e atendimento é exclusiva do
            estabelecimento escolhido.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-3 text-xl font-bold tracking-widest uppercase">
            2. Assinaturas e Pagamentos
          </h2>
          <p>
            As assinaturas do plano PRO são processadas via{" "}
            <strong>Stripe</strong>. Ao assinar, você concorda com a renovação
            automática. O cancelamento pode ser feito a qualquer momento pelo
            painel, interrompendo a cobrança do próximo ciclo. Não oferecemos
            reembolso por períodos de assinatura já utilizados.
          </p>
        </section>

        <section className="bg-secondary/20 border-primary rounded-lg border-l-4 p-6">
          <h2 className="text-foreground mb-3 text-xl font-bold tracking-widest uppercase">
            3. Isenção de Responsabilidade
          </h2>
          <p className="mb-4">
            O AgdlyFlow <strong>não se responsabiliza</strong> por:
          </p>
          <ul className="ml-5 list-disc space-y-2">
            <li>
              Agendamentos não cumpridos ou cancelamentos de última hora por
              ambas as partes.
            </li>
            <li>Conflitos financeiros entre o cliente e o barbeiro.</li>
            <li>
              Indisponibilidade temporária do sistema devido a falhas técnicas
              ou manutenção.
            </li>
            <li>Perda de dados por mau uso da conta pelo usuário.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-foreground mb-3 text-xl font-bold tracking-widest uppercase">
            4. Modificações
          </h2>
          <p>
            Reservamo-nos o direito de alterar funcionalidades ou valores de
            planos com aviso prévio de 30 dias aos assinantes ativos.
          </p>
        </section>
      </div>
    </div>
  )
}

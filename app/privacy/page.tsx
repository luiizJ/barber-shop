export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-extrabold tracking-tighter italic">
        Privacidade{" "}
        <span className="text-primary text-sm font-normal not-italic">
          — AgdlyFlow
        </span>
      </h1>

      <div className="text-muted-foreground space-y-8">
        <section>
          <h2 className="text-foreground mb-3 text-xl font-bold tracking-widest uppercase">
            1. Dados Coletados
          </h2>
          <p>
            Para o funcionamento da plataforma, coletamos apenas o essencial:
          </p>
          <ul className="ml-5 list-disc space-y-2">
            <li>
              <strong>Identificação:</strong> Nome, foto e e-mail via Login
              Social (Google).
            </li>
            <li>
              <strong>Negócio:</strong> Dados da barbearia (nome, endereço,
              serviços e preços) fornecidos pelo dono.
            </li>
            <li>
              <strong>Pagamento:</strong> Dados de faturamento são processados
              diretamente pelo Stripe. Nós não armazenamos números de cartão de
              crédito.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-foreground mb-3 text-xl font-bold tracking-widest uppercase">
            2. Uso dos Dados
          </h2>
          <p>
            Seus dados são usados exclusivamente para gerenciar seus
            agendamentos e sua assinatura. O AgdlyFlow **nunca venderá seus
            dados** para terceiros.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-3 text-xl font-bold tracking-widest uppercase">
            3. Seus Direitos (LGPD)
          </h2>
          <p>
            Conforme a Lei Geral de Proteção de Dados, você tem o direito de
            solicitar a exportação ou a exclusão definitiva dos seus dados a
            qualquer momento, o que resultará no encerramento da sua conta.
          </p>
        </section>

        <section className="border-t pt-8 text-sm">
          <p>
            Contato para questões de privacidade:{" "}
            <span className="text-primary">lznv.dev@gmail.com</span>
          </p>
        </section>
      </div>
    </div>
  )
}

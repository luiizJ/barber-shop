import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion"

const FaqSection = () => {
  return (
    <section className="bg-zinc-900/30 py-16 md:py-24">
      <div className="container mx-auto max-w-3xl px-4">
        <h2 className="mb-10 text-center text-2xl font-bold md:text-3xl">
          Perguntas Frequentes
        </h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1" className="border-zinc-800">
            <AccordionTrigger className="text-left text-base md:text-lg">
              Preciso cadastrar cartão agora?
            </AccordionTrigger>
            <AccordionContent className="text-base text-zinc-400">
              Não! Você tem 15 dias de acesso total sem precisar informar cartão
              de crédito. Só paga se gostar e quiser continuar.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2" className="border-zinc-800">
            <AccordionTrigger className="text-left text-base md:text-lg">
              Funciona no iPhone e Android?
            </AccordionTrigger>
            <AccordionContent className="text-base text-zinc-400">
              Sim! O AgdlyFlow roda direto no navegador, sem precisar instalar
              nada pesado. Funciona em qualquer celular, tablet ou computador.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3" className="border-zinc-800">
            <AccordionTrigger className="text-left text-base md:text-lg">
              Como meus clientes agendam?
            </AccordionTrigger>
            <AccordionContent className="text-base text-zinc-400">
              Você ganha um link exclusivo (ex: agdly.com/suabarbearia). Você
              envia esse link no WhatsApp ou coloca no Instagram, e eles agendam
              sozinhos.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  )
}

export default FaqSection

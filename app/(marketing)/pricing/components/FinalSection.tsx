import { Button } from "@/app/components/ui/button"
import Link from "next/link"

const FinalSection = () => {
  return (
    <section className="px-4 py-20 text-center">
      <div className="container mx-auto">
        <h2 className="mx-auto mb-8 max-w-2xl text-2xl font-bold md:text-4xl">
          Transforme sua barbearia ainda hoje.
        </h2>
        <Link href="#planos">
          <Button
            size="lg"
            className="shadow-primary/25 h-14 animate-pulse px-10 text-lg font-bold shadow-lg"
          >
            Quero Testar Grátis
          </Button>
        </Link>
      </div>
    </section>
  )
}

export default FinalSection

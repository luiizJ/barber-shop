import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import Header from "@/app/components/Header"
import HeroSection from "./components/HeroSection"
import BenefitSection from "./components/BenefitSection"
import PlanSection from "./components/PlanSession"
import FaqSection from "./components/FaqSection"
import FinalSection from "./components/FinalSection"

export default async function PricingPage() {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* 2. HERO SECTION */}
        <HeroSection />

        {/* 3. BENEFÍCIOS (Grid)*/}
        <BenefitSection />

        {/* 4. PREÇOS (Seus Cards)*/}
        <PlanSection />

        {/* 5. FAQ  */}
        <FaqSection />

        {/* 6. CTA FINAL */}
        <FinalSection />
      </main>
    </div>
  )
}

import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { InterfaceSection } from "@/components/interface-section"
import { UniqueFeaturesSection } from "@/components/unique-features-section"
import { StatsSection } from "@/components/stats-section"
import { FaqSection } from "@/components/faq-section"
import { CtaSection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function Page() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <InterfaceSection />
        <UniqueFeaturesSection />
        <StatsSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  )
}

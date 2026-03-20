import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { FeatureCards } from "@/components/feature-cards"
import { DemoSection } from "@/components/demo-section"
import { AudienceSection } from "@/components/audience-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      <Header />
      <HeroSection />
      <FeatureCards />
      <DemoSection />
      <AudienceSection />
      <CTASection />
      <Footer />
    </main>
  )
}

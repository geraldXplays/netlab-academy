import { useEffect } from 'react'
import { Hero } from '@/sections/landing/Hero'
import { Manifesto } from '@/sections/landing/Manifesto'
import { TopologySection } from '@/sections/landing/TopologySection'
import { LevelsSection } from '@/sections/landing/LevelsSection'
import { SimulatorTeaser } from '@/sections/landing/SimulatorTeaser'
import { FeaturesSection } from '@/sections/landing/FeaturesSection'
import { FinalCta } from '@/sections/landing/FinalCta'
import { useI18n } from '@/i18n'

export default function Landing() {
  const { d } = useI18n()
  useEffect(() => {
    document.title = `NetLab Academy — ${d.brand.tagline}`
  }, [d])
  return (
    <>
      <Hero />
      <Manifesto />
      <TopologySection />
      <LevelsSection />
      <SimulatorTeaser />
      <FeaturesSection />
      <FinalCta />
    </>
  )
}

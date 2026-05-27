import { useState } from 'react'
import HeroSection from '../sections/HeroSection'
import RestaurantList from '../sections/RestaurantList'
import HowItWorks from '../components/HowItWorks'
import BestSellers from '../components/BestSellers'
import TopBrands from '../components/TopBrands'
import AppDownloadBanner from '../components/AppDownloadBanner'
import FAQ from '../components/FAQ'
import Testimonials from '../components/Testimonials'
import Footer from '../components/Footer'

export default function CustomerPage({ onToast }) {
  const [search, setSearch] = useState('')

  return (
    <>
      <main>
        {/* 1. Hero — Search + CTA + Stats */}
        <HeroSection onSearch={setSearch} />

        {/* 2. How It Works — 4 steps */}
        <HowItWorks />

        {/* 3. Best Sellers — Featured dish + Top 3 */}
        <BestSellers onToast={onToast} />

        {/* 4. Restaurant List — filterable grid */}
        <RestaurantList searchQuery={search} onToast={onToast} />

        {/* 5. Top Brands — Partner restaurants */}
        <TopBrands />

        {/* 6. App Download Banner */}
        <AppDownloadBanner />

        {/* 7. Testimonials — Customer reviews */}
        <Testimonials />

        {/* 8. FAQ — Accordion */}
        <FAQ />
      </main>

      {/* Footer */}
      <Footer />
    </>
  )
}

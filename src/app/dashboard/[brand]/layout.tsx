import { notFound } from 'next/navigation'
import { getBrandConfig, isValidBrandSlug } from '@/lib/brand-config'

interface BrandLayoutProps {
  children: React.ReactNode
  params: { brand: string }
}

export default function BrandLayout({ children, params }: BrandLayoutProps) {
  const { brand } = params
  
  // Validate brand slug
  if (!isValidBrandSlug(brand)) {
    notFound()
  }
  
  const brandConfig = getBrandConfig(brand)
  
  if (!brandConfig) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}

// Generate static paths for known brands
export function generateStaticParams() {
  return [
    { brand: 'daily-dish-dash' },
    { brand: 'grit-collective' }
  ]
}

// Set metadata based on brand
export function generateMetadata({ params }: { params: { brand: string } }) {
  const brandConfig = getBrandConfig(params.brand)
  
  return {
    title: `${brandConfig?.name || 'Brand'} - Cheetah CMS`,
    description: brandConfig?.description || 'Content management system'
  }
}
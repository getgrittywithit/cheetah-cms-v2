import { getBrandConfig } from '@/lib/brand-config'
import { notFound, redirect } from 'next/navigation'

interface BrandAnalyticsPageProps {
  params: { brand: string }
}

export default function BrandAnalyticsPage({ params }: BrandAnalyticsPageProps) {
  const { brand } = params
  const brandConfig = getBrandConfig(brand)
  
  if (!brandConfig) {
    notFound()
  }

  // For now, redirect to the current analytics page
  redirect('/dashboard/analytics')
}
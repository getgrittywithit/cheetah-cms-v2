import { getBrandConfig } from '@/lib/brand-config'
import { notFound, redirect } from 'next/navigation'

interface BrandSettingsPageProps {
  params: { brand: string }
}

export default function BrandSettingsPage({ params }: BrandSettingsPageProps) {
  const { brand } = params
  const brandConfig = getBrandConfig(brand)
  
  if (!brandConfig) {
    notFound()
  }

  // For now, redirect to the current settings page
  redirect('/dashboard/settings')
}
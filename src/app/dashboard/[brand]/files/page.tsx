import { getBrandConfig, getBrandBucket } from '@/lib/brand-config'
import { notFound, redirect } from 'next/navigation'

interface BrandFilesPageProps {
  params: { brand: string }
}

export default function BrandFilesPage({ params }: BrandFilesPageProps) {
  const { brand } = params
  const brandConfig = getBrandConfig(brand)
  
  if (!brandConfig) {
    notFound()
  }

  // For now, redirect to the current files page
  // Later we'll implement brand-scoped file management
  redirect('/dashboard/files')
}
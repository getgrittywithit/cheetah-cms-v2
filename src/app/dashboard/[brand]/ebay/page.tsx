import { getBrandConfig } from '@/lib/brand-config'
import { notFound } from 'next/navigation'
import EbayListingManager from '@/components/ebay/ebay-listing-manager'

interface EbayPageProps {
  params: { brand: string }
}

export default function EbayPage({ params }: EbayPageProps) {
  const { brand } = params
  const brandConfig = getBrandConfig(brand)
  
  if (!brandConfig) {
    notFound()
  }

  // Only show eBay for Grit Collective
  if (brand !== 'grit-collective') {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl font-bold"
            style={{ backgroundColor: brandConfig.theme.primary }}
          >
            {brandConfig.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">eBay Listings</h1>
            <p className="text-gray-600">AI-powered listing optimization for {brandConfig.name}</p>
          </div>
        </div>
      </div>

      <EbayListingManager brandConfig={brandConfig} />
    </div>
  )
}
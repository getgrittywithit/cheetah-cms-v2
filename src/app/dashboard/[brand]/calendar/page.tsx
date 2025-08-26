import { getBrandConfig } from '@/lib/brand-config'
import { notFound } from 'next/navigation'
import BrandCalendar from '@/components/calendar/brand-calendar'

interface BrandCalendarPageProps {
  params: { brand: string }
}

export default function BrandCalendarPage({ params }: BrandCalendarPageProps) {
  const { brand } = params
  const brandConfig = getBrandConfig(brand)
  
  if (!brandConfig) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Brand Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl font-bold"
              style={{ backgroundColor: brandConfig.theme.primary }}
            >
              {brandConfig.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Content Calendar</h1>
              <p className="text-gray-600">Schedule and manage social media posts for {brandConfig.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Component */}
      <BrandCalendar brandConfig={brandConfig} />
    </div>
  )
}
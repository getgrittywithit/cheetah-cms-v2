'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronDown, Check } from 'lucide-react'
import { getAllBrands, type BrandConfig } from '@/lib/brand-config'
import { clsx } from 'clsx'

interface BrandSwitcherProps {
  currentBrand: string
}

export default function BrandSwitcher({ currentBrand }: BrandSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const brands = getAllBrands()
  
  const currentBrandConfig = brands.find(b => b.slug === currentBrand)

  const handleBrandSwitch = (newBrandSlug: string) => {
    // Replace the current brand in the URL with the new one
    const newPath = pathname.replace(`/dashboard/${currentBrand}`, `/dashboard/${newBrandSlug}`)
    router.push(newPath)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-left bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: currentBrandConfig?.theme.primary || '#3B82F6' }}
          />
          <div>
            <div className="text-sm font-medium text-white">
              {currentBrandConfig?.name || 'Daily Dish Dash'}
            </div>
            <div className="text-xs text-gray-400">
              {currentBrandConfig?.industry || 'Food & Cooking'}
            </div>
          </div>
        </div>
        <ChevronDown 
          className={clsx(
            "w-4 h-4 text-gray-400 transition-transform",
            isOpen && "transform rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {brands.map((brand) => (
            <button
              key={brand.slug}
              onClick={() => handleBrandSwitch(brand.slug)}
              className="flex items-center justify-between w-full px-3 py-3 text-left hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: brand.theme.primary }}
                />
                <div>
                  <div className="text-sm font-medium text-white">
                    {brand.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {brand.industry}
                  </div>
                </div>
              </div>
              {brand.slug === currentBrand && (
                <Check className="w-4 h-4 text-blue-400" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
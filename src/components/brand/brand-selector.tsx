'use client'

import { useState } from 'react'
import { useBrand } from '@/contexts/brand-context'
import { ChevronDown, Check, Building2 } from 'lucide-react'

export default function BrandSelector() {
  const { currentBrand, allBrands, switchBrand } = useBrand()
  const [isOpen, setIsOpen] = useState(false)

  if (!currentBrand) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="flex items-center space-x-2">
          {currentBrand.logo ? (
            <img
              src={currentBrand.logo}
              alt={currentBrand.name}
              className="w-6 h-6 rounded"
            />
          ) : (
            <div 
              className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: currentBrand.guidelines.visual.primaryColors[0] || '#3B82F6' }}
            >
              {currentBrand.name.charAt(0)}
            </div>
          )}
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900">{currentBrand.name}</p>
            <p className="text-xs text-gray-700">{currentBrand.industry}</p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-700 px-3 py-2 uppercase tracking-wide">
              Select Brand
            </div>
            {allBrands.map((brand) => (
              <button
                key={brand.id}
                onClick={() => {
                  switchBrand(brand.id)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-50 ${
                  currentBrand.id === brand.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="w-8 h-8 rounded"
                    />
                  ) : (
                    <div 
                      className="w-8 h-8 rounded flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: brand.guidelines.visual.primaryColors[0] || '#3B82F6' }}
                    >
                      {brand.name.charAt(0)}
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">{brand.name}</p>
                    <p className="text-xs text-gray-700">{brand.industry}</p>
                  </div>
                </div>
                {currentBrand.id === brand.id && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
          
          <div className="border-t border-gray-100 p-2">
            <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
              <Building2 className="w-4 h-4" />
              <span>Manage Brands</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
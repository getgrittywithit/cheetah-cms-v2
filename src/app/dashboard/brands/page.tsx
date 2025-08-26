'use client'

import { getAllBrands } from '@/lib/brand-config'
import Link from 'next/link'
import { Building, Palette, Users, Sparkles } from 'lucide-react'

export default function BrandsPage() {
  const brands = getAllBrands()

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Brand Management</h1>
        <p className="text-gray-600">Manage all your brand profiles and switch between them</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brands.map(brand => (
          <Link
            key={brand.slug}
            href={`/dashboard/${brand.slug}`}
            className="group block"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:scale-105">
              {/* Brand Header */}
              <div className="flex items-center space-x-3 mb-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold text-lg"
                  style={{ backgroundColor: brand.theme.primary }}
                >
                  {brand.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700">
                    {brand.name}
                  </h3>
                  <p className="text-sm text-gray-500">/{brand.slug}</p>
                </div>
              </div>

              {/* Brand Description */}
              <p className="text-gray-600 mb-4 line-clamp-2">
                {brand.description}
              </p>

              {/* Brand Stats */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Building className="w-4 h-4" />
                  <span>{brand.industry}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  <span className="line-clamp-1">{brand.targetAudience}</span>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Palette className="w-4 h-4" />
                  <div className="flex space-x-1">
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: brand.theme.primary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: brand.theme.secondary }}
                    />
                    {brand.theme.accent && (
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: brand.theme.accent }}
                      />
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Sparkles className="w-4 h-4" />
                  <span className="line-clamp-1">{brand.aiSettings.voice}</span>
                </div>
              </div>

              {/* Social Platforms */}
              <div className="flex flex-wrap gap-1 mb-4">
                {Object.entries(brand.socialTokens).map(([platform, token]) => {
                  if (!token || platform.includes('Id')) return null
                  return (
                    <span
                      key={platform}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full capitalize"
                    >
                      {platform}
                    </span>
                  )
                })}
              </div>

              {/* Action Button */}
              <div className="text-center">
                <span 
                  className="inline-flex items-center px-4 py-2 rounded-lg text-white font-medium text-sm group-hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: brand.theme.primary }}
                >
                  Open Dashboard
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Add New Brand Info */}
      <div className="mt-12 bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300">
        <div className="text-center">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Add New Brand</h3>
          <p className="text-gray-600 mb-4">
            To add a new brand, update the brand configuration in <code className="bg-gray-200 px-2 py-1 rounded text-sm">src/lib/brand-config.ts</code>
          </p>
          <p className="text-sm text-gray-500">
            See the documentation in the file for step-by-step instructions.
          </p>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Package, ArrowRight, Building2 } from 'lucide-react'

export default function ProductsRedirect() {
  const router = useRouter()
  const [showOptions, setShowOptions] = useState(false)

  useEffect(() => {
    // Auto-redirect after 3 seconds, but show options first
    const timer = setTimeout(() => {
      router.replace('/dashboard/grit-collective/products')
    }, 3000)

    // Show options immediately
    setShowOptions(true)

    return () => clearTimeout(timer)
  }, [router])

  const brands = [
    {
      name: 'Grit Collective',
      slug: 'grit-collective',
      description: 'Adventure and lifestyle products',
      color: 'bg-blue-600'
    },
    {
      name: 'Daily Dish Dash',
      slug: 'daily-dish-dash', 
      description: 'Food and recipe content',
      color: 'bg-green-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-2xl mx-auto">
        {showOptions ? (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Products Management</h1>
              <p className="text-gray-600">
                Products are now managed per brand. Choose your brand to continue:
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {brands.map((brand) => (
                <Link
                  key={brand.slug}
                  href={`/dashboard/${brand.slug}/products`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${brand.color} rounded-lg flex items-center justify-center`}>
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                          {brand.name} Products
                        </h3>
                        <p className="text-sm text-gray-600">{brand.description}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center text-sm text-gray-500">
              <p>Auto-redirecting to Grit Collective in <span className="font-medium">3 seconds</span></p>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        )}
      </div>
    </div>
  )
}
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Package, ArrowRight } from 'lucide-react'
import { getBrandConfig } from '@/lib/brand-config'

export default function BrandProductsRedirect({ params }: { params: { brand: string } }) {
  const router = useRouter()
  const brandConfig = getBrandConfig(params.brand)

  useEffect(() => {
    // Redirect to global products page which has all the working functionality
    const timer = setTimeout(() => {
      router.replace('/dashboard/products')
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  if (!brandConfig) {
    return <div>Brand not found</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-lg mx-auto text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-blue-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {brandConfig.name} Products
          </h1>
          
          <p className="text-gray-600 mb-6">
            Redirecting you to the complete products management system with Printful sync, 
            AI content generation, and canvas maker...
          </p>

          <div className="flex items-center justify-center space-x-2 text-blue-600 mb-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Loading products interface...</span>
          </div>

          <button
            onClick={() => router.push('/dashboard/products')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Products Now
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>

          <p className="text-sm text-gray-500 mt-4">
            Auto-redirecting in 2 seconds...
          </p>
        </div>
      </div>
    </div>
  )
}
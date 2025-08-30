'use client'

import Link from 'next/link'
import { Package, ArrowRight, ExternalLink } from 'lucide-react'
import { getBrandConfig } from '@/lib/brand-config'

export default function BrandProductsPage({ params }: { params: { brand: string } }) {
  const brandConfig = getBrandConfig(params.brand)

  if (!brandConfig) {
    return <div>Brand not found</div>
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {brandConfig.name} Products
        </h1>
        <p className="text-gray-700">
          Manage your product catalog and Printful integration for {brandConfig.name}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Brand-Specific Products Coming Soon
        </h2>
        <p className="text-gray-600 mb-6">
          For now, please use the global products page which has all the working functionality:
          Printful sync, canvas maker, AI content generation, and more.
        </p>

        <div className="space-y-4">
          <Link
            href="/dashboard/products"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Package className="w-5 h-5 mr-2" />
            Go to Products (Global)
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>

          <p className="text-sm text-gray-500">
            You can find "Products (Global)" in the System section of the left navigation
          </p>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { Plus, RefreshCw, Package, Edit2, Eye, Trash2, ExternalLink, ShoppingCart, Users, Wand2 } from 'lucide-react'
import AIProductGenerator from '@/components/ai/ai-product-generator'
import type { GeneratedProductData } from '@/lib/ai-product-generator'
import { getBrandConfig } from '@/lib/brand-config'

interface PrintfulProduct {
  id: number
  external_id: string
  name: string
  thumbnail: string
  base_price: number
  variant_count: number
  synced: boolean
  variants: Array<{
    id: number
    name: string
    sku: string
    price: number
    product_name: string
    image: string
    synced: boolean
  }>
}

interface Product {
  id: string
  name: string
  description: string
  short_description?: string
  price: number
  compare_at_price?: number
  sku?: string
  status: 'draft' | 'active' | 'archived'
  visibility: 'visible' | 'hidden'
  product_type: string
  tags: string[]
  featured_image?: string
  printful_sync_product_id?: string
  created_at: string
  updated_at: string
}

export default function BrandProductsPage({ params }: { params: { brand: string } }) {
  const [products, setProducts] = useState<Product[]>([])
  const [printfulProducts, setPrintfulProducts] = useState<PrintfulProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('products')
  const [selectedProduct, setSelectedProduct] = useState<PrintfulProduct | null>(null)
  const [syncing, setSyncing] = useState<number | null>(null)
  const [showAIGenerator, setShowAIGenerator] = useState<PrintfulProduct | null>(null)

  const brandConfig = getBrandConfig(params.brand)

  const syncProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/printful/sync?brand=${params.brand}`)
      const data = await response.json()
      
      if (data.success) {
        alert(`Successfully synced ${data.synced_count} products from Printful to ${brandConfig?.name}!`)
        // Refresh both product lists
        fetchProducts()
        fetchPrintfulProducts()
      } else {
        alert(`Sync failed: ${data.error}`)
      }
    } catch (error) {
      console.error('Sync error:', error)
      alert('Failed to sync with Printful')
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/brands/${params.brand}/products`)
      const data = await response.json()
      
      if (data.success) {
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const fetchPrintfulProducts = async () => {
    // This would fetch Printful products specifically for display
    // For now, we'll sync them which also fetches them
  }

  const handleAIGenerate = async (productData: GeneratedProductData, product: PrintfulProduct) => {
    try {
      console.log('AI Generated content for product:', product.name)
      console.log('Generated data:', productData)
      
      // Here you would typically save this data to your product
      // For now, just show success
      alert('AI content generated successfully!')
      setShowAIGenerator(null)
    } catch (error) {
      console.error('Error generating AI content:', error)
      alert('Failed to generate AI content')
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [params.brand])

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
        {/* Updated: Force deployment refresh */}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('products')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'products'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span>Current Products ({products.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('printful')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'printful'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span>Printful Sync</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Current Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <Package className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.filter(p => p.status === 'active').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Drafts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.filter(p => p.status === 'draft').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <RefreshCw className="w-3 h-3 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Printful</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.filter(p => p.printful_sync_product_id).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Products List */}
          <div className="bg-white rounded-lg shadow-sm">
            {products.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
                <p className="text-gray-700 mb-4">
                  Sync products from Printful to get started with {brandConfig.name}.
                </p>
                <button
                  onClick={() => setActiveTab('printful')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sync from Printful
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {products.map((product) => (
                  <div key={product.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Product Image */}
                    <div className="aspect-square bg-gray-100 relative">
                      {product.featured_image ? (
                        <img
                          src={product.featured_image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div className="absolute top-2 left-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          product.status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : product.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.status}
                        </span>
                      </div>

                      {/* Printful Badge */}
                      {product.printful_sync_product_id && (
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                            Printful
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-1 truncate">{product.name}</h3>
                      
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-lg font-bold text-gray-900">${product.price}</p>
                        {product.compare_at_price && (
                          <p className="text-sm text-gray-600 line-through">${product.compare_at_price}</p>
                        )}
                      </div>
                      
                      {product.short_description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {product.short_description}
                        </p>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => window.open(`/brands/${params.brand}/products/${product.id}`, '_blank')}
                            className="p-1 hover:bg-gray-100 rounded" 
                            title="View on Storefront"
                          >
                            <Eye className="w-4 h-4 text-gray-700" />
                          </button>
                          <button 
                            onClick={() => window.location.href = `/dashboard/${params.brand}/products/${product.id}`}
                            className="p-1 hover:bg-gray-100 rounded" 
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4 text-gray-700" />
                          </button>
                        </div>
                        
                        <div className="text-xs text-gray-700">
                          SKU: {product.sku || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Printful Sync Tab */}
      {activeTab === 'printful' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Sync from Printful to {brandConfig.name}
                </h2>
                <p className="text-gray-600">
                  Import your completed Printful products directly into {brandConfig.name}'s catalog
                </p>
              </div>
              <button
                onClick={syncProducts}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Syncing...' : 'Sync from Printful'}
              </button>
            </div>
          </div>

          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <RefreshCw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Sync</h3>
            <p className="text-gray-600 mb-4">
              Click the sync button above to import your Printful products for {brandConfig.name}.
            </p>
            <p className="text-sm text-gray-500">
              Make sure you have products in your Printful dashboard first.
            </p>
            <a
              href="https://www.printful.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mt-4"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Open Printful Dashboard
            </a>
          </div>
        </div>
      )}

      {/* AI Generator Modal */}
      {showAIGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">AI Content Generator</h2>
                <p className="text-sm text-gray-600">Generate marketing content for: {showAIGenerator.name}</p>
              </div>
              <button
                onClick={() => setShowAIGenerator(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <div className="p-6">
              <AIProductGenerator
                productName={showAIGenerator.name}
                productImage={showAIGenerator.thumbnail}
                onGenerate={(data) => handleAIGenerate(data, showAIGenerator)}
                brandContext={brandConfig.name}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
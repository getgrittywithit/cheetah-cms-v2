'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Package, ExternalLink, ShoppingCart, Eye, Wand2 } from 'lucide-react'
import AIProductGenerator from '@/components/ai/ai-product-generator'
import type { GeneratedProductData } from '@/lib/ai-product-generator'

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

export default function PrintfulSync() {
  const [products, setProducts] = useState<PrintfulProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState('grit-collective')
  const [selectedProduct, setSelectedProduct] = useState<PrintfulProduct | null>(null)
  const [syncing, setSyncing] = useState<number | null>(null)
  const [publishing, setPublishing] = useState<number | null>(null)
  const [showPublishForm, setShowPublishForm] = useState<PrintfulProduct | null>(null)
  const [showAIGenerator, setShowAIGenerator] = useState<PrintfulProduct | null>(null)
  const [publishForm, setPublishForm] = useState({
    title: '',
    description: '',
    tags: '',
    seoTitle: '',
    seoDescription: '',
    status: 'draft'
  })

  const syncProducts = async (brandSlug?: string) => {
    const brand = brandSlug || selectedBrand
    setLoading(true)
    try {
      const response = await fetch(`/api/printful/sync?brand=${brand}`)
      const data = await response.json()
      
      if (data.success) {
        setProducts(data.products)
        console.log(`Synced ${data.count} products from Printful`)
      } else {
        alert(`Sync failed: ${data.error}`)
      }
    } catch (error) {
      console.error('Sync failed:', error)
      alert('Failed to sync products from Printful')
    } finally {
      setLoading(false)
    }
  }

  const syncSingleProduct = async (productId: number) => {
    setSyncing(productId)
    try {
      const response = await fetch('/api/printful/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSelectedProduct(data.product)
        // Update the product in the list
        setProducts(prev => prev.map(p => 
          p.id === productId ? data.product : p
        ))
      } else {
        alert(`Sync failed: ${data.error}`)
      }
    } catch (error) {
      console.error('Single product sync failed:', error)
      alert('Failed to sync product details')
    } finally {
      setSyncing(null)
    }
  }

  const publishToShopify = async () => {
    if (!showPublishForm) return
    
    setPublishing(showPublishForm.id)
    try {
      console.log('AI Generated Data:', aiGeneratedData)
      console.log('Publish Form:', publishForm)
      
      // Send AI data if available, otherwise use form data
      const requestData = aiGeneratedData ? {
        printful_product_id: showPublishForm.id,
        // Send all AI-generated fields
        ...aiGeneratedData,
        // Override with any manual form changes
        title: publishForm.title || aiGeneratedData.title,
        description: publishForm.description || aiGeneratedData.description,
        tags: publishForm.tags ? publishForm.tags.split(', ') : aiGeneratedData.tags,
        seoTitle: publishForm.seoTitle || aiGeneratedData.seoTitle,
        seoDescription: publishForm.seoDescription || aiGeneratedData.seoDescription,
        status: publishForm.status || aiGeneratedData.status
      } : {
        printful_product_id: showPublishForm.id,
        custom_title: publishForm.title,
        custom_description: publishForm.description,
        custom_tags: publishForm.tags,
        seo_title: publishForm.seoTitle,
        seo_description: publishForm.seoDescription,
        status: publishForm.status
      }
      
      console.log('Request Data being sent:', requestData)

      const response = await fetch('/api/shopify/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert(`Successfully published "${data.shopify_product.title}" to Shopify!`)
        setShowPublishForm(null)
        setPublishForm({
          title: '',
          description: '',
          tags: '',
          seoTitle: '',
          seoDescription: '',
          status: 'draft'
        })
      } else {
        alert(`Publishing failed: ${data.error}`)
      }
    } catch (error) {
      console.error('Publishing error:', error)
      alert('Failed to publish to Shopify')
    } finally {
      setPublishing(null)
    }
  }

  const prepareForShopify = (product: PrintfulProduct) => {
    setShowPublishForm(product)
    setPublishForm({
      title: `${product.name} - Canvas Print`,
      description: `Transform your space with this premium ${product.name.toLowerCase()} canvas print. High-quality materials and vibrant colors bring your walls to life.`,
      tags: 'canvas art, wall decor, motivational, home decor, grit collective',
      seoTitle: `${product.name} - Premium Canvas Wall Art | Grit Collective`,
      seoDescription: `Shop ${product.name} canvas prints at Grit Collective. Premium quality, fast shipping, satisfaction guaranteed.`,
      status: 'draft'
    })
  }

  const openAIGenerator = (product: PrintfulProduct) => {
    setShowAIGenerator(product)
  }

  const [aiGeneratedData, setAIGeneratedData] = useState<GeneratedProductData | null>(null)

  const handleAIDataGenerated = (data: GeneratedProductData) => {
    console.log('AI Data Generated:', data)
    // Store the complete AI data
    setAIGeneratedData(data)
    
    // Update the form for display
    setPublishForm({
      title: data.title,
      description: data.description,
      tags: data.tags.join(', '),
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      status: data.status === 'active' ? 'active' : 'draft'
    })
    setShowAIGenerator(null)
    setShowPublishForm(showAIGenerator) // Open the publish form with AI data
  }

  useEffect(() => {
    syncProducts()
  }, [])

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Printful Products</h2>
            <p className="text-gray-600">
              Sync completed products from Printful to your selected brand
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="grit-collective">Grit Collective</option>
                <option value="daily-dish-dash">Daily Dish Dash</option>
              </select>
            </div>
            <button
              onClick={() => syncProducts()}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 mt-6"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Syncing...' : 'Sync from Printful'}
            </button>
          </div>
        </div>
      </div>

      {products.length === 0 && !loading ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Found</h3>
          <p className="text-gray-600 mb-4">
            Create some products in Printful first, then sync them here.
          </p>
          <a
            href="https://www.printful.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Open Printful Dashboard
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Products ({products.length})</h3>
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-sm p-4 border hover:border-blue-300 cursor-pointer transition-colors"
                onClick={() => setSelectedProduct(product)}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0">
                    {product.thumbnail ? (
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-gray-400 m-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                    <p className="text-sm text-gray-600">
                      {product.variant_count} variant{product.variant_count !== 1 ? 's' : ''} • 
                      From ${product.base_price.toFixed(2)}
                    </p>
                    <div className="flex items-center mt-2 space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        product.synced 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {product.synced ? '✓ Synced' : '⏳ Pending'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          syncSingleProduct(product.id)
                        }}
                        disabled={syncing === product.id}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {syncing === product.id ? 'Syncing...' : 'Refresh'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Product Details */}
          <div className="bg-white rounded-lg shadow-sm">
            {selectedProduct ? (
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold">{selectedProduct.name}</h3>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Printful ID</label>
                    <p className="text-gray-900">{selectedProduct.id}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">External ID</label>
                    <p className="text-gray-900">{selectedProduct.external_id || 'Not set'}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Variants ({selectedProduct.variant_count})</label>
                    <div className="mt-2 space-y-2">
                      {selectedProduct.variants.map((variant) => (
                        <div key={variant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium text-sm">{variant.name}</p>
                            <p className="text-xs text-gray-600">{variant.product_name}</p>
                            <p className="text-xs text-gray-500">SKU: {variant.sku}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-green-600">${variant.price.toFixed(2)}</p>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              variant.synced 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {variant.synced ? '✓' : '⏳'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-3">
                    <button 
                      onClick={() => openAIGenerator(selectedProduct)}
                      className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate with AI
                    </button>
                    
                    <button 
                      onClick={() => prepareForShopify(selectedProduct)}
                      className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Manual Setup
                    </button>
                    
                    <p className="text-xs text-gray-500 text-center">
                      Use AI to auto-generate all product details, or set up manually
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Select a product to view details</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Shopify Publishing Modal */}
      {showPublishForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Publish to Shopify</h2>
                <button
                  onClick={() => setShowPublishForm(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    value={publishForm.title}
                    onChange={(e) => setPublishForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter product title for Shopify"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Description *
                  </label>
                  <textarea
                    value={publishForm.description}
                    onChange={(e) => setPublishForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                    placeholder="Enter detailed product description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={publishForm.tags}
                    onChange={(e) => setPublishForm(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="canvas art, wall decor, motivational"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      value={publishForm.seoTitle}
                      onChange={(e) => setPublishForm(prev => ({ ...prev, seoTitle: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="SEO-optimized title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={publishForm.status}
                      onChange={(e) => setPublishForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Description
                  </label>
                  <textarea
                    value={publishForm.seoDescription}
                    onChange={(e) => setPublishForm(prev => ({ ...prev, seoDescription: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                    placeholder="Meta description for search engines (160 characters max)"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <button
                    onClick={() => setShowPublishForm(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={publishToShopify}
                    disabled={publishing === showPublishForm.id || !publishForm.title || !publishForm.description}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {publishing === showPublishForm.id ? 'Publishing...' : 'Publish to Shopify'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Product Generator Modal */}
      {showAIGenerator && (
        <AIProductGenerator
          productName={showAIGenerator.name}
          productImage={showAIGenerator.thumbnail}
          variants={showAIGenerator.variants}
          onDataGenerated={handleAIDataGenerated}
          onClose={() => setShowAIGenerator(null)}
        />
      )}
    </div>
  )
}
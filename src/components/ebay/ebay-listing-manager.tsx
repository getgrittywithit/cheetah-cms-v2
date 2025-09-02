'use client'

import { useState, useEffect } from 'react'
import { 
  Store,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  ExternalLink,
  Sparkles,
  Link as LinkIcon,
  FileText,
  DollarSign,
  Tag,
  Clock,
  BarChart3
} from 'lucide-react'
import { BrandConfig } from '@/lib/brand-config'

interface EbayListing {
  id: string
  title: string
  description: string
  price: number
  category: string
  keywords: string[]
  condition: string
  status: 'draft' | 'optimized' | 'published'
  ebay_url?: string
  views?: number
  watchers?: number
  created_at: string
  updated_at: string
}

interface EbayListingManagerProps {
  brandConfig: BrandConfig
}

export default function EbayListingManager({ brandConfig }: EbayListingManagerProps) {
  const [listings, setListings] = useState<EbayListing[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [optimizing, setOptimizing] = useState(false)

  // AI Optimization form state
  const [optimizationInput, setOptimizationInput] = useState({
    type: 'link', // 'link' or 'description'
    productLink: '',
    productDescription: '',
    targetPrice: '',
    category: 'Collectibles'
  })

  // Generated listing state
  const [generatedListing, setGeneratedListing] = useState<{
    title: string
    description: string
    keywords: string[]
    suggestedPrice: number
    condition: string
  } | null>(null)

  useEffect(() => {
    loadListings()
  }, [])

  const loadListings = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/brands/${brandConfig.slug}/ebay/listings`)
      const data = await response.json()
      
      if (data.success) {
        setListings(data.listings || [])
      } else {
        console.error('Failed to load listings:', data.error)
      }
    } catch (error) {
      console.error('Error loading listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const optimizeWithAI = async () => {
    if (!optimizationInput.productLink && !optimizationInput.productDescription) {
      return
    }

    setOptimizing(true)
    try {
      const response = await fetch(`/api/brands/${brandConfig.slug}/ebay/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: optimizationInput.type,
          productLink: optimizationInput.productLink,
          productDescription: optimizationInput.productDescription,
          targetPrice: optimizationInput.targetPrice ? parseFloat(optimizationInput.targetPrice) : undefined,
          category: optimizationInput.category
        })
      })

      const data = await response.json()

      if (data.success) {
        setGeneratedListing(data.listing)
      } else {
        alert('Failed to optimize listing: ' + data.error)
      }
    } catch (error) {
      console.error('Error optimizing listing:', error)
      alert('Failed to optimize listing')
    } finally {
      setOptimizing(false)
    }
  }

  const saveListing = async () => {
    if (!generatedListing) return

    try {
      const response = await fetch(`/api/brands/${brandConfig.slug}/ebay/listings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: generatedListing.title,
          description: generatedListing.description,
          price: generatedListing.suggestedPrice,
          category: optimizationInput.category,
          keywords: generatedListing.keywords,
          condition: generatedListing.condition,
          status: 'optimized'
        })
      })

      const data = await response.json()

      if (data.success) {
        await loadListings()
        setShowCreateModal(false)
        setGeneratedListing(null)
        setOptimizationInput({
          type: 'link',
          productLink: '',
          productDescription: '',
          targetPrice: '',
          category: 'Collectibles'
        })
      } else {
        alert('Failed to save listing: ' + data.error)
      }
    } catch (error) {
      console.error('Error saving listing:', error)
      alert('Failed to save listing')
    }
  }

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'optimized': return 'bg-blue-100 text-blue-800'
      case 'published': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search listings..."
          />
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          <Sparkles className="w-4 h-4" />
          <span>Create AI-Optimized Listing</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Store className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{listings.length}</p>
              <p className="text-gray-600">Total Listings</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Eye className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {listings.filter(l => l.status === 'published').length}
              </p>
              <p className="text-gray-600">Published</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {listings.filter(l => l.status === 'optimized').length}
              </p>
              <p className="text-gray-600">AI-Optimized</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {listings.reduce((sum, l) => sum + (l.views || 0), 0)}
              </p>
              <p className="text-gray-600">Total Views</p>
            </div>
          </div>
        </div>
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 font-bold">eBay Listings ({filteredListings.length})</h3>
        </div>
        
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Store className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No listings found</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 text-blue-600 hover:text-blue-700"
            >
              Create your first AI-optimized listing
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-900">Title</th>
                  <th className="text-left p-4 font-medium text-gray-900">Category</th>
                  <th className="text-left p-4 font-medium text-gray-900">Price</th>
                  <th className="text-left p-4 font-medium text-gray-900">Status</th>
                  <th className="text-left p-4 font-medium text-gray-900">Performance</th>
                  <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredListings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-900 truncate max-w-xs">
                          {listing.title}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {listing.keywords.slice(0, 3).map((keyword) => (
                            <span 
                              key={keyword}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                            >
                              {keyword}
                            </span>
                          ))}
                          {listing.keywords.length > 3 && (
                            <span className="text-xs text-gray-400">
                              +{listing.keywords.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{listing.category}</td>
                    <td className="p-4">
                      <span className="font-medium text-gray-900">
                        ${listing.price.toFixed(2)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(listing.status)}`}>
                        {listing.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {listing.views || 0}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {listing.watchers || 0}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {listing.ebay_url && (
                          <a
                            href={listing.ebay_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-blue-600"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button className="p-2 text-gray-400 hover:text-blue-600">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Listing Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-semibold">AI-Powered Listing Optimizer</h3>
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setGeneratedListing(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              {!generatedListing ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Input Type
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="link"
                          checked={optimizationInput.type === 'link'}
                          onChange={(e) => setOptimizationInput({ ...optimizationInput, type: e.target.value as 'link' | 'description' })}
                          className="mr-2"
                        />
                        <LinkIcon className="w-4 h-4 mr-1" />
                        Product Link
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="description"
                          checked={optimizationInput.type === 'description'}
                          onChange={(e) => setOptimizationInput({ ...optimizationInput, type: e.target.value as 'link' | 'description' })}
                          className="mr-2"
                        />
                        <FileText className="w-4 h-4 mr-1" />
                        Product Description
                      </label>
                    </div>
                  </div>

                  {optimizationInput.type === 'link' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Link *
                      </label>
                      <input
                        type="url"
                        value={optimizationInput.productLink}
                        onChange={(e) => setOptimizationInput({ ...optimizationInput, productLink: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com/product-page"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Description *
                      </label>
                      <textarea
                        value={optimizationInput.productDescription}
                        onChange={(e) => setOptimizationInput({ ...optimizationInput, productDescription: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                        placeholder="Describe the product you want to sell on eBay..."
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Price (Optional)
                      </label>
                      <input
                        type="number"
                        value={optimizationInput.targetPrice}
                        onChange={(e) => setOptimizationInput({ ...optimizationInput, targetPrice: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="25.00"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={optimizationInput.category}
                        onChange={(e) => setOptimizationInput({ ...optimizationInput, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option>Collectibles</option>
                        <option>Antiques</option>
                        <option>Art</option>
                        <option>Books</option>
                        <option>Clothing, Shoes & Accessories</option>
                        <option>Crafts</option>
                        <option>Dolls & Bears</option>
                        <option>Home & Garden</option>
                        <option>Jewelry & Watches</option>
                        <option>Pottery & Glass</option>
                        <option>Sports Mem, Cards & Fan Shop</option>
                        <option>Toys & Hobbies</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={optimizeWithAI}
                      disabled={optimizing || (!optimizationInput.productLink && !optimizationInput.productDescription)}
                      className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {optimizing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Optimizing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Generate Optimized Listing</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Sparkles className="w-5 h-5 text-green-600 mr-2" />
                      <h4 className="font-medium text-green-900">AI-Optimized Listing Generated!</h4>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      Your listing has been optimized for maximum visibility and sales potential.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Optimized Title
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium">{generatedListing.title}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Optimized Description
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg max-h-40 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-sm">{generatedListing.description}</pre>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Suggested Price
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="font-medium text-green-600">${generatedListing.suggestedPrice}</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Condition
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p>{generatedListing.condition}</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Keywords ({generatedListing.keywords.length})
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex flex-wrap gap-1">
                            {generatedListing.keywords.map((keyword) => (
                              <span 
                                key={keyword}
                                className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setGeneratedListing(null)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-700"
                    >
                      Generate New
                    </button>
                    <button
                      onClick={saveListing}
                      className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Save Listing</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
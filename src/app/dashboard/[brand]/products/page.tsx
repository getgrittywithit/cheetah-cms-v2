'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Package, Edit2, Eye, Trash2, ExternalLink, RefreshCw } from 'lucide-react'
import { useBrand } from '@/contexts/brand-context'
import { Product, ProductStats } from '@/types/product'

export default function BrandProductsPage({ params }: { params: { brand: string } }) {
  const { currentBrand } = useBrand()
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<ProductStats>({
    total_products: 0,
    active_products: 0,
    draft_products: 0,
    archived_products: 0,
    total_variants: 0,
    low_stock_count: 0
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [productTypeFilter, setProductTypeFilter] = useState('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    product_type: 'handmade',
    price: '',
    sku: '',
    track_inventory: false,
    quantity: '',
    status: 'draft'
  })

  // Fetch products for current brand
  useEffect(() => {
    const fetchProducts = async () => {
      if (!params.brand) return
      
      try {
        const response = await fetch(`/api/brands/${params.brand}/products`)
        const data = await response.json()
        
        if (data.success) {
          setProducts(data.products || [])
          setStats(data.stats || stats)
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [params.brand])

  // Filter products based on active tab, search, and product type
  const filteredProducts = products.filter(product => {
    const matchesTab = activeTab === 'all' || product.status === activeTab
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesProductType = productTypeFilter === 'all' || product.product_type === productTypeFilter
    
    return matchesTab && matchesSearch && matchesProductType
  })

  const handleCreateProduct = () => {
    setShowCreateForm(true)
  }

  const handleSyncPrintful = async () => {
    setSyncing(true)
    try {
      const response = await fetch(`/api/printful/sync?brand=${params.brand}`)
      const data = await response.json()
      
      if (data.success) {
        alert(`Successfully synced ${data.synced_count} products from Printful!`)
        // Refresh products list
        const fetchProducts = async () => {
          const response = await fetch(`/api/brands/${params.brand}/products`)
          const data = await response.json()
          
          if (data.success) {
            setProducts(data.products || [])
            setStats(data.stats || stats)
          }
        }
        fetchProducts()
      } else {
        alert(`Sync failed: ${data.error}`)
      }
    } catch (error) {
      console.error('Sync error:', error)
      alert('Failed to sync with Printful')
    } finally {
      setSyncing(false)
    }
  }

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch(`/api/brands/${params.brand}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newProduct,
          price: parseFloat(newProduct.price) || 0,
          quantity: newProduct.track_inventory ? parseInt(newProduct.quantity) || null : null,
        }),
      })

      if (response.ok) {
        // Reset form and close modal
        setNewProduct({
          name: '',
          description: '',
          product_type: 'handmade',
          price: '',
          sku: '',
          track_inventory: false,
          quantity: '',
          status: 'draft'
        })
        setShowCreateForm(false)
        
        // Refresh products list
        const fetchProducts = async () => {
          const response = await fetch(`/api/brands/${params.brand}/products`)
          const data = await response.json()
          
          if (data.success) {
            setProducts(data.products || [])
            setStats(data.stats || stats)
          }
        }
        fetchProducts()
      }
    } catch (error) {
      console.error('Error creating product:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {currentBrand?.name || params.brand} Products
            </h1>
            <p className="text-gray-700">Manage your product catalog and inventory</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleSyncPrintful}
              disabled={syncing}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Sync Printful'}</span>
            </button>
            <button
              onClick={handleCreateProduct}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_products}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.active_products}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.draft_products}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-gray-900">{stats.low_stock_count}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
              <select
                value={productTypeFilter}
                onChange={(e) => setProductTypeFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="handmade">Handmade</option>
                <option value="printful">Print-on-Demand</option>
                <option value="digital">Digital</option>
              </select>
              <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <span>More Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="px-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'all', label: 'All Products', count: stats.total_products },
              { key: 'active', label: 'Active', count: stats.active_products },
              { key: 'draft', label: 'Drafts', count: stats.draft_products },
              { key: 'archived', label: 'Archived', count: stats.archived_products }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Products Grid */}
      <div className="bg-white rounded-lg shadow-sm">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-700 mb-4">
              {searchTerm ? 'No products match your search.' : 'Get started by creating your first product.'}
            </p>
            <button
              onClick={handleCreateProduct}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredProducts.map((product) => (
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

                  {/* Platform Badges */}
                  <div className="absolute top-2 right-2 flex flex-col space-y-1">
                    {product.shopify_product_id && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Shopify</span>
                    )}
                    {product.printful_sync_product_id && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Printful</span>
                    )}
                    {product.etsy_listing_id && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">Etsy</span>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-1 truncate">{product.name}</h3>
                  
                  {/* Product Type Badge */}
                  {product.product_type && (
                    <div className="mb-2">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        product.product_type === 'handmade' 
                          ? 'bg-blue-100 text-blue-800'
                          : product.product_type === 'printful'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.product_type === 'printful' ? 'Print-on-Demand' : 
                         product.product_type.charAt(0).toUpperCase() + product.product_type.slice(1)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-2">
                    <p className="text-lg font-bold text-gray-900">${product.price}</p>
                    {product.compare_at_price && (
                      <p className="text-sm text-gray-600 line-through">${product.compare_at_price}</p>
                    )}
                  </div>
                  
                  {/* Inventory Info */}
                  {product.track_inventory && (
                    <p className={`text-sm mb-3 ${
                      (product.quantity || 0) < 10 ? 'text-red-600' : 'text-gray-700'
                    }`}>
                      {product.quantity || 0} in stock
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button className="p-1 hover:bg-gray-100 rounded" title="View">
                        <Eye className="w-4 h-4 text-gray-700" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded" title="Edit">
                        <Edit2 className="w-4 h-4 text-gray-700" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded" title="Delete">
                        <Trash2 className="w-4 h-4 text-gray-700" />
                      </button>
                      {product.shopify_product_id && (
                        <button className="p-1 hover:bg-gray-100 rounded" title="View on Shopify">
                          <ExternalLink className="w-4 h-4 text-gray-700" />
                        </button>
                      )}
                    </div>
                    
                    {/* Sales Info */}
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

      {/* Create Product Modal/Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Create New Product</h2>
            </div>
            <form onSubmit={handleSubmitProduct} className="p-6 space-y-6">
              {/* Product Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Type *
                </label>
                <select
                  value={newProduct.product_type}
                  onChange={(e) => setNewProduct({...newProduct, product_type: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="handmade">Handmade</option>
                  <option value="printful">Print-on-Demand (Printful)</option>
                  <option value="digital">Digital Product</option>
                </select>
                <p className="text-sm text-gray-600 mt-1">
                  {newProduct.product_type === 'handmade' && 'Products you create and ship yourself'}
                  {newProduct.product_type === 'printful' && 'Products printed and shipped by Printful'}
                  {newProduct.product_type === 'digital' && 'Downloads, software, or digital content'}
                </p>
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter product name"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your product"
                />
              </div>

              {/* Price and SKU */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price * ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Product SKU"
                  />
                </div>
              </div>

              {/* Inventory Tracking */}
              <div>
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id="track_inventory"
                    checked={newProduct.track_inventory}
                    onChange={(e) => setNewProduct({...newProduct, track_inventory: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="track_inventory" className="ml-2 text-sm text-gray-700">
                    Track inventory for this product
                  </label>
                </div>
                
                {newProduct.track_inventory && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Initial Quantity
                    </label>
                    <input
                      type="number"
                      value={newProduct.quantity}
                      onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={newProduct.status}
                  onChange={(e) => setNewProduct({...newProduct, status: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                </select>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
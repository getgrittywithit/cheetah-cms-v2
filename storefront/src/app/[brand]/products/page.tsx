'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { Search, Grid, List } from 'lucide-react'
import { getStorefrontProducts, formatPrice } from '@/lib/api'
import { Product } from '@/types/product'
import { useCart } from '@/contexts/cart-context'

export default function ProductsPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = use(params)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [productTypeFilter, setProductTypeFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const { addToCart } = useCart()

  const brandConfig = {
    'daily-dish-dash': {
      name: 'Daily Dish Dash',
      theme: { primary: '#FF6B6B', secondary: '#4ECDC4' }
    },
    'grit-collective': {
      name: 'Grit Collective Co.',
      theme: { primary: '#2D4A3A', secondary: '#8B7355' }
    }
  }[brand]

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getStorefrontProducts(brand)
        setProducts(data)
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [brand])

  const handleAddToCart = (product: Product) => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.featured_image || '',
      sku: product.sku || undefined
    })
  }

  // Filter and sort products
  const filteredProducts = products
    .filter(product => 
      (!searchTerm || 
       product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       product.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      (productTypeFilter === 'all' || product.product_type === productTypeFilter)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'name':
        default:
          return a.name.localeCompare(b.name)
      }
    })

  if (!brandConfig) {
    return <div>Brand not found</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Products</h1>
        <p className="text-gray-600">Discover our complete collection</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            {/* Product Type Filter */}
            <select
              value={productTypeFilter}
              onChange={(e) => setProductTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="handmade">Handmade</option>
              <option value="printful">Print-on-Demand</option>
              <option value="digital">Digital</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            {/* View Mode */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-200" />
              <div className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-6 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-8`}>
          {filteredProducts.map((product) => (
            <div key={product.id} className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow ${viewMode === 'list' ? 'flex' : ''}`}>
              <Link href={`/${brand}/products/${product.slug}`} className={viewMode === 'list' ? 'flex-shrink-0' : ''}>
                <div className={`bg-gray-100 relative overflow-hidden ${viewMode === 'list' ? 'w-48 h-48' : 'aspect-square'}`}>
                  {product.featured_image ? (
                    <img
                      src={product.featured_image}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>
              </Link>
              <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <Link href={`/${brand}/products/${product.slug}`}>
                  <h3 className="text-lg font-medium text-gray-900 mb-2 hover:text-gray-700">
                    {product.name}
                  </h3>
                </Link>
                
                {/* Product Type Badge */}
                {product.product_type && (
                  <div className="mb-3">
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
                
                {product.short_description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.short_description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                    {product.compare_at_price && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.compare_at_price)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90"
                    style={{ backgroundColor: brandConfig.theme.primary }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'No products match your search.' : 'No products available yet.'}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  )
}
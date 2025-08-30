'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { ArrowRight, Truck, Shield, RefreshCw } from 'lucide-react'
import { getStorefrontProducts, formatPrice } from '@/lib/api'
import { Product } from '@/types/product'
import { useCart } from '@/contexts/cart-context'

export default function BrandHomePage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = use(params)
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()

  const brandConfig = {
    'daily-dish-dash': {
      name: 'Daily Dish Dash',
      theme: { primary: '#FF6B6B', secondary: '#4ECDC4' },
      hero: {
        title: 'Quick & Delicious Recipes',
        subtitle: 'For busy people who love great food',
        cta: 'Shop Recipe Books'
      }
    },
    'grit-collective': {
      name: 'Grit Collective Co.',
      theme: { primary: '#2D4A3A', secondary: '#8B7355' },
      hero: {
        title: 'Handcrafted with Love',
        subtitle: 'Unique home décor, candles, and personalized items that inspire positive emotions',
        cta: 'Shop Collection'
      }
    }
  }[brand]

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await getStorefrontProducts(brand)
        setFeaturedProducts(products.slice(0, 6)) // Show first 6 products
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

  if (!brandConfig) {
    return <div>Brand not found</div>
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              {brandConfig.hero.title}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {brandConfig.hero.subtitle}
            </p>
            <Link
              href={`/${brand}/products`}
              className="inline-flex items-center px-8 py-4 text-lg font-medium text-white rounded-lg transition-colors hover:opacity-90"
              style={{ backgroundColor: brandConfig.theme.primary }}
            >
              {brandConfig.hero.cta}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: brandConfig.theme.primary + '20' }}>
                <Truck className="w-6 h-6" style={{ color: brandConfig.theme.primary }} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Free Shipping</h3>
              <p className="text-gray-600">Free shipping on orders over $75</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: brandConfig.theme.primary + '20' }}>
                <Shield className="w-6 h-6" style={{ color: brandConfig.theme.primary }} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Secure Checkout</h3>
              <p className="text-gray-600">Your payment information is safe and secure</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: brandConfig.theme.primary + '20' }}>
                <RefreshCw className="w-6 h-6" style={{ color: brandConfig.theme.primary }} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Easy Returns</h3>
              <p className="text-gray-600">30-day return policy on all items</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our most popular items, handpicked just for you
            </p>
          </div>

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
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                  <Link href={`/${brand}/products/${product.slug}`}>
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
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
                  <div className="p-6">
                    <Link href={`/${brand}/products/${product.slug}`}>
                      <h3 className="text-lg font-medium text-gray-900 mb-2 hover:text-gray-700">
                        {product.name}
                      </h3>
                    </Link>
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
              <p className="text-gray-600 mb-4">No products available yet.</p>
              <p className="text-sm text-gray-500">
                Products will appear here once they&apos;re added to the CMS and marked as active.
              </p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href={`/${brand}/products`}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: brandConfig.theme.primary }}
            >
              View All Products
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Stay Connected</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Get the latest updates on new products and exclusive offers
          </p>
          <div className="flex max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              className="px-6 py-3 text-white font-medium rounded-r-lg transition-colors hover:opacity-90"
              style={{ backgroundColor: brandConfig.theme.primary }}
            >
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
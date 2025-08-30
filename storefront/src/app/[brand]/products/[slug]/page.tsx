'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { Heart, Share, Plus, Minus, ShoppingCart, Truck } from 'lucide-react'
import { formatPrice } from '@/lib/api'
import { Product } from '@/types/product'
import { useCart } from '@/contexts/cart-context'

export default function ProductPage({ 
  params 
}: { 
  params: Promise<{ brand: string; slug: string }> 
}) {
  const { brand, slug } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
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
    const fetchProduct = async () => {
      try {
        // For now, we'll need to search by slug since we don't have a slug-based endpoint yet
        // This is a placeholder - you'd need to implement getProductBySlug in your CMS API
        const products = await fetch(`http://localhost:3000/api/brands/${brand}/products`)
          .then(res => res.json())
          .then(data => data.products || [])
        
        const foundProduct = products.find((p: Product) => p.slug === slug)
        setProduct(foundProduct || null)
      } catch (error) {
        console.error('Error fetching product:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [brand, slug])

  const handleAddToCart = () => {
    if (!product) return
    
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.featured_image || '',
      sku: product.sku || undefined
    })
    
    // Reset quantity
    setQuantity(1)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-gray-200 rounded-lg" />
            <div>
              <div className="h-8 bg-gray-200 rounded mb-4" />
              <div className="h-6 bg-gray-200 rounded mb-6" />
              <div className="h-4 bg-gray-200 rounded mb-2" />
              <div className="h-4 bg-gray-200 rounded mb-2" />
              <div className="h-4 bg-gray-200 rounded mb-8" />
              <div className="h-12 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-8">The product you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href={`/${brand}/products`}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: brandConfig?.theme.primary }}
          >
            Back to Products
          </Link>
        </div>
      </div>
    )
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.featured_image].filter((img): img is string => Boolean(img))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm">
          <li><Link href={`/${brand}`} className="text-gray-500 hover:text-gray-700">Home</Link></li>
          <li className="text-gray-400">/</li>
          <li><Link href={`/${brand}/products`} className="text-gray-500 hover:text-gray-700">Products</Link></li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-900 font-medium">{product.name}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div>
          {/* Main Image */}
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
            {images[selectedImage] ? (
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>

          {/* Thumbnail Images */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-gray-400' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
          
          {/* Product Type Badge */}
          {product.product_type && (
            <div className="mb-4">
              <span className={`inline-block px-3 py-1 text-sm rounded-full ${
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
          
          {/* Price */}
          <div className="flex items-center space-x-4 mb-6">
            <span className="text-3xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.compare_at_price && (
              <span className="text-xl text-gray-500 line-through">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="prose prose-sm text-gray-700 mb-8">
              <p>{product.description}</p>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg w-32">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 hover:bg-gray-50"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="flex-1 text-center py-2 font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 hover:bg-gray-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Add to Cart */}
          <div className="space-y-4 mb-8">
            <button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center px-8 py-4 text-lg font-medium text-white rounded-lg transition-colors hover:opacity-90"
              style={{ backgroundColor: brandConfig?.theme.primary }}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </button>
            
            {/* Wishlist and Share */}
            <div className="flex space-x-4">
              <button className="flex-1 flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Heart className="w-4 h-4 mr-2" />
                Add to Wishlist
              </button>
              <button className="flex-1 flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Share className="w-4 h-4 mr-2" />
                Share
              </button>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="border-t pt-8">
            <div className="flex items-start space-x-3">
              <Truck className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Shipping Information</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Free shipping on orders over $75</li>
                  <li>• Standard shipping: 5-7 business days</li>
                  <li>• Express shipping: 2-3 business days</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="border-t pt-8 mt-8">
            <h3 className="font-medium text-gray-900 mb-4">Product Details</h3>
            <dl className="space-y-2 text-sm">
              {product.sku && (
                <div className="flex">
                  <dt className="font-medium text-gray-700 w-24">SKU:</dt>
                  <dd className="text-gray-600">{product.sku}</dd>
                </div>
              )}
              {product.weight && (
                <div className="flex">
                  <dt className="font-medium text-gray-700 w-24">Weight:</dt>
                  <dd className="text-gray-600">{product.weight} {product.weight_unit}</dd>
                </div>
              )}
              <div className="flex">
                <dt className="font-medium text-gray-700 w-24">Shipping:</dt>
                <dd className="text-gray-600">{product.requires_shipping ? 'Required' : 'Digital Product'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
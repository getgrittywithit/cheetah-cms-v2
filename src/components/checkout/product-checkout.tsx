'use client'

import { useState } from 'react'
import { ShoppingCart, Plus, Minus, CreditCard } from 'lucide-react'
import { getCurrencySymbol } from '@/lib/stripe'

interface Product {
  id: string
  name: string
  description: string
  price: number
  featured_image?: string
  product_type: string
  status: string
}

interface ProductCheckoutProps {
  product: Product
  brandSlug: string
}

export default function ProductCheckout({ product, brandSlug }: ProductCheckoutProps) {
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [customerEmail, setCustomerEmail] = useState('')

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(1, quantity + change)
    setQuantity(newQuantity)
  }

  const handleCheckout = async () => {
    if (!customerEmail.trim()) {
      alert('Please enter your email address')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/brands/${brandSlug}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [{
            product_id: product.id,
            quantity: quantity
          }],
          customer_email: customerEmail,
          metadata: {
            source: 'product_page'
          }
        })
      })

      const data = await response.json()

      if (data.success && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const totalPrice = product.price * quantity
  const currency = getCurrencySymbol('usd')

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="space-y-4">
        {/* Price Display */}
        <div className="text-3xl font-bold text-gray-900">
          {currency}{product.price.toFixed(2)}
        </div>

        {/* Product Type Badge */}
        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
          {product.product_type === 'handmade' && (
            <span className="bg-emerald-100 text-emerald-800">✨ Handcrafted</span>
          )}
          {product.product_type === 'printful' && (
            <span className="bg-purple-100 text-purple-800">🎨 Made to Order</span>
          )}
          {product.product_type === 'digital' && (
            <span className="bg-blue-100 text-blue-800">💾 Digital Download</span>
          )}
        </div>

        {/* Quantity Selector */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Quantity</label>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 border border-gray-300 rounded-md min-w-[60px] text-center">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(1)}
              className="p-2 rounded-md border border-gray-300 hover:bg-gray-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Customer Email */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Email Address</label>
          <input
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Total Price */}
        {quantity > 1 && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total:</span>
              <span>{currency}{totalPrice.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={loading || !customerEmail.trim()}
          className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ) : (
            <CreditCard className="w-5 h-5 mr-2" />
          )}
          {loading ? 'Processing...' : 'Buy Now'}
        </button>

        {/* Security Notice */}
        <div className="text-xs text-gray-500 text-center">
          🔒 Secure checkout powered by Stripe
        </div>

        {/* Product Type Info */}
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
          {product.product_type === 'handmade' && (
            <p>This item is handcrafted and will be prepared especially for you. Please allow 3-5 business days for processing.</p>
          )}
          {product.product_type === 'printful' && (
            <p>This item is made to order using print-on-demand technology. Please allow 5-7 business days for production and shipping.</p>
          )}
          {product.product_type === 'digital' && (
            <p>This is a digital product. You'll receive a download link immediately after purchase.</p>
          )}
        </div>
      </div>
    </div>
  )
}
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Package, Mail, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface OrderDetails {
  id: string
  total_amount: number
  currency: string
  customer_email: string
  items: Array<{
    product_name: string
    product_type: string
    quantity: number
    price: number
  }>
  status: string
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sessionId) {
      fetchOrderDetails()
    }
  }, [sessionId])

  const fetchOrderDetails = async () => {
    try {
      // You'll need to create this endpoint
      const response = await fetch(`/api/checkout/session/${sessionId}`)
      const data = await response.json()
      
      if (data.success && data.order) {
        setOrderDetails(data.order)
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
            <p className="text-gray-600">
              Thank you for your purchase. Your order has been successfully processed.
            </p>
          </div>

          {orderDetails ? (
            <>
              {/* Order Details */}
              <div className="border-t border-b border-gray-200 py-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-gray-500">Order Total</span>
                  <span className="text-2xl font-bold text-gray-900">
                    ${orderDetails.total_amount.toFixed(2)}
                  </span>
                </div>
                
                <div className="space-y-3">
                  {orderDetails.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.product_name}</p>
                        <p className="text-sm text-gray-500">
                          {item.product_type === 'handmade' && '✨ Handcrafted'}
                          {item.product_type === 'printful' && '🎨 Made to Order'}
                          {item.product_type === 'digital' && '💾 Digital Download'}
                          {item.quantity > 1 && ` × ${item.quantity}`}
                        </p>
                      </div>
                      <span className="font-medium text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Steps */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900">Confirmation Email</h3>
                    <p className="text-sm text-gray-600">
                      We've sent a confirmation email to {orderDetails.customer_email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Package className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900">Order Processing</h3>
                    <p className="text-sm text-gray-600">
                      {orderDetails.items.some(item => item.product_type === 'digital') ? (
                        'Digital items are being prepared for download. Check your email for download links.'
                      ) : orderDetails.items.some(item => item.product_type === 'printful') ? (
                        'Your items are being prepared for production. This typically takes 3-5 business days.'
                      ) : (
                        'Your order is being processed. Handcrafted items typically take 3-5 business days to prepare.'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">
                We're processing your order. You should receive a confirmation email shortly.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link
              href="/"
              className="flex-1 flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </Link>
            <button
              onClick={() => window.print()}
              className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Print Receipt
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
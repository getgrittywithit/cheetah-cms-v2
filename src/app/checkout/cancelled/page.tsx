'use client'

import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function CheckoutCancelledPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          {/* Cancelled Header */}
          <div className="mb-8">
            <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout Cancelled</h1>
            <p className="text-gray-600">
              Your order was cancelled. No payment was processed.
            </p>
          </div>

          {/* Message */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <p className="text-gray-700 mb-4">
              Don't worry! Your cart items are still available if you'd like to try again.
            </p>
            <p className="text-sm text-gray-500">
              If you experienced any issues during checkout, please don't hesitate to contact us for assistance.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/"
              className="flex-1 flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Shopping
            </Link>
            <button
              onClick={() => window.history.back()}
              className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import { 
  Zap,
  ShoppingBag,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Settings,
  Truck,
  Globe
} from 'lucide-react'

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
        <p className="text-gray-600">Connect and manage third-party platforms and services</p>
      </div>

      {/* Integration Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Integrations</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Connected</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Setup</p>
              <p className="text-2xl font-semibold text-gray-900">3</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Globe className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-2xl font-semibold text-gray-900">12</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Integrations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Printful Integration */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Truck className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">Printful</h3>
                <p className="text-sm text-gray-600">Print-on-demand fulfillment</p>
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Not Connected
            </span>
          </div>
          
          <div className="space-y-3 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              Automatic order fulfillment
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              Product catalog sync
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              Inventory management
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              Shipping tracking
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Connect Printful
            </button>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Etsy Integration */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">Etsy</h3>
                <p className="text-sm text-gray-600">Marketplace integration</p>
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Not Connected
            </span>
          </div>
          
          <div className="space-y-3 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              Cross-platform product listing
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              Order synchronization
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              Inventory sync
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              Analytics tracking
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Connect Etsy
            </button>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Available Integrations */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Available Integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Shopify</h3>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-3">E-commerce platform sync</p>
            <button className="w-full text-blue-600 text-sm font-medium">Coming Soon</button>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Amazon</h3>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-3">Marketplace selling</p>
            <button className="w-full text-blue-600 text-sm font-medium">Coming Soon</button>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Mailchimp</h3>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-3">Email marketing</p>
            <button className="w-full text-blue-600 text-sm font-medium">Coming Soon</button>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Google Analytics</h3>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-3">Website analytics</p>
            <button className="w-full text-blue-600 text-sm font-medium">Coming Soon</button>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Stripe</h3>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-3">Payment processing</p>
            <button className="w-full text-blue-600 text-sm font-medium">Coming Soon</button>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Zapier</h3>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-3">Workflow automation</p>
            <button className="w-full text-blue-600 text-sm font-medium">Coming Soon</button>
          </div>
        </div>
      </div>
    </div>
  )
}
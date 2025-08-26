'use client'

import { CheckCircle, AlertCircle, Settings, TrendingUp, Package, DollarSign } from 'lucide-react'

export default function PlatformsPage() {
  const platforms = [
    {
      name: 'Shopify',
      status: 'connected',
      logo: '🛍️',
      stats: {
        sales: '$2,450',
        products: 47,
        orders: 152
      },
      color: 'green',
      description: 'Your main e-commerce storefront'
    },
    {
      name: 'Etsy',
      status: 'setup-needed',
      logo: '🎨',
      stats: {
        sales: '$0',
        products: 0,
        orders: 0
      },
      color: 'orange',
      description: 'Marketplace for handmade & vintage items'
    },
    {
      name: 'Printful',
      status: 'connected',
      logo: '👕',
      stats: {
        sales: '$847',
        products: 23,
        orders: 68
      },
      color: 'blue',
      description: 'Print-on-demand fulfillment'
    }
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Platforms</h1>
        <p className="text-gray-700">Manage your connections to e-commerce platforms</p>
      </div>

      {/* Platform Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {platforms.map((platform) => (
          <div key={platform.name} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{platform.logo}</span>
                <div>
                  <h3 className="font-semibold text-lg">{platform.name}</h3>
                  <p className="text-sm text-gray-700">{platform.description}</p>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-4 h-4 text-gray-700" />
              </button>
            </div>

            {/* Status */}
            <div className="mb-4">
              {platform.status === 'connected' ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">Connected</span>
                </div>
              ) : (
                <div className="flex items-center text-orange-600">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">Setup Required</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-700">
                  <DollarSign className="w-4 h-4 mr-2" />
                  <span className="text-sm">Sales</span>
                </div>
                <span className="font-semibold">{platform.stats.sales}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-700">
                  <Package className="w-4 h-4 mr-2" />
                  <span className="text-sm">Products</span>
                </div>
                <span className="font-semibold">{platform.stats.products}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-700">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <span className="text-sm">Orders</span>
                </div>
                <span className="font-semibold">{platform.stats.orders}</span>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-4">
              {platform.status === 'connected' ? (
                <button className="w-full py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  Sync Products
                </button>
              ) : (
                <button className="w-full py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Setup Guide
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
            <h3 className="font-medium mb-1">Bulk Sync</h3>
            <p className="text-sm text-gray-700">Update all platforms at once</p>
          </button>
          <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
            <h3 className="font-medium mb-1">Price Update</h3>
            <p className="text-sm text-gray-700">Adjust pricing across platforms</p>
          </button>
          <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
            <h3 className="font-medium mb-1">Inventory Check</h3>
            <p className="text-sm text-gray-700">Verify stock levels</p>
          </button>
          <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
            <h3 className="font-medium mb-1">Platform Fees</h3>
            <p className="text-sm text-gray-700">Compare commission rates</p>
          </button>
        </div>
      </div>

      {/* Platform-Specific Settings */}
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Platform Settings</h2>
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Shopify Integration</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-700">Store URL:</span>
                <span className="ml-2">gritcollective.myshopify.com</span>
              </div>
              <div>
                <span className="text-gray-700">Last Sync:</span>
                <span className="ml-2">2 hours ago</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Etsy Integration</h3>
            <p className="text-sm text-gray-700 mb-3">Connect your Etsy shop to start syncing products</p>
            <button className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
              Connect Etsy Shop
            </button>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Printful Integration</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-700">API Status:</span>
                <span className="ml-2 text-green-600">Active</span>
              </div>
              <div>
                <span className="text-gray-700">Fulfillment:</span>
                <span className="ml-2">Automatic</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Helper */}
    </div>
  )
}
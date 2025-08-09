'use client'

import { useState } from 'react'
import { Plus, Upload, Package, Edit2, Eye, Trash2 } from 'lucide-react'
import AIHelper from '@/components/layout/AIHelper'

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState('create')
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <p className="text-gray-600">Create and manage your products across all platforms</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('create')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'create'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Create New</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'library'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span>Product Library</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Create Tab */}
      {activeTab === 'create' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Smart Product Creator</h2>
          
          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Image
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600">
                Drop your image here or click to upload
              </p>
              <p className="text-xs text-gray-500 mt-1">
                AI will auto-detect aspect ratio and suggest product types
              </p>
            </div>
          </div>

          {/* Product Concept */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Concept
            </label>
            <input
              type="text"
              placeholder="e.g., Motivational poster with mountain landscape..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* AI Generated Content */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-3">AI-Generated Content</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Title</label>
                <div className="mt-1 p-3 bg-white rounded border text-gray-700">
                  AI will generate an SEO-optimized title...
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Description</label>
                <div className="mt-1 p-3 bg-white rounded border text-gray-700 h-24">
                  AI will create compelling product description...
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Suggested Price</label>
                  <div className="mt-1 p-3 bg-white rounded border text-gray-700">
                    $--
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Tags</label>
                  <div className="mt-1 p-3 bg-white rounded border text-gray-700">
                    Generated tags...
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Publish Options */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span className="text-sm">Shopify</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span className="text-sm">Etsy</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span className="text-sm">Printful</span>
              </label>
            </div>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Create & Publish
            </button>
          </div>
        </div>
      )}

      {/* Library Tab */}
      {activeTab === 'library' && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Product Library</h2>
              <div className="flex space-x-2">
                <button className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">
                  Bulk Edit
                </button>
                <button className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">
                  Export
                </button>
              </div>
            </div>
          </div>
          
          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {/* Sample Product Card */}
            <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-gray-100 relative">
                <div className="absolute top-2 right-2 flex space-x-1">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Shopify</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Etsy</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1">Sample Product Title</h3>
                <p className="text-sm text-gray-600 mb-3">$24.99</p>
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Trash2 className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <div className="text-xs text-gray-500">
                    23 sales
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Helper */}
      <AIHelper context="products" />
    </div>
  )
}
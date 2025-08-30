'use client'

import { useState } from 'react'
import { Plus, Upload, Package, Edit2, Eye, Trash2, Palette, RefreshCw } from 'lucide-react'
import CanvasCreator from './canvas-creator'
import PrintfulSync from './printful-sync'

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState('printful')
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <p className="text-gray-700">Create and manage your products across all platforms</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('create')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'create'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Create New</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('canvas')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'canvas'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4" />
              <span>Canvas Creator</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('printful')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'printful'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span>Printful Sync</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'library'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
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
              <Upload className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-700">
                Drop your image here or click to upload
              </p>
              <p className="text-xs text-gray-600 mt-1">
                AI will auto-detect aspect ratio and suggest product types
              </p>
            </div>
          </div>

          {/* Product Concept */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Concept
            </label>
            <textarea
              placeholder="Describe your product concept or let AI suggest based on your image..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
            />
          </div>

          {/* Target Platforms */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Platforms
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['Shopify', 'Printful', 'Etsy', 'Amazon'].map((platform) => (
                <label key={platform} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    defaultChecked={platform === 'Shopify' || platform === 'Printful'}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{platform}</span>
                </label>
              ))}
            </div>
          </div>

          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Generate Product Ideas
          </button>
        </div>
      )}

      {/* Canvas Creator Tab */}
      {activeTab === 'canvas' && <CanvasCreator />}

      {/* Printful Sync Tab */}
      {activeTab === 'printful' && <PrintfulSync />}

      {/* Product Library Tab */}
      {activeTab === 'library' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Product Library</h2>
            <div className="flex space-x-3">
              <button className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                Filter
              </button>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                Sort
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Sample Product Cards */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-100 relative">
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-gray-400" />
                  </div>
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <button className="p-1 bg-white rounded shadow-sm hover:bg-gray-50">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1 bg-white rounded shadow-sm hover:bg-gray-50">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-1 bg-white rounded shadow-sm hover:bg-gray-50 text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-1">Sample Product {i}</h3>
                  <p className="text-sm text-gray-600 mb-2">Canvas Print • 12×16"</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">$24.99</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Active</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          <div className="text-center py-12 text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No products yet</h3>
            <p className="mb-4">Create your first product using the Canvas Creator or sync from Printful</p>
            <div className="space-x-3">
              <button
                onClick={() => setActiveTab('canvas')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Canvas
              </button>
              <button
                onClick={() => setActiveTab('printful')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Sync from Printful
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
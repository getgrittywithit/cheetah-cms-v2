'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Check, AlertCircle, ExternalLink, Settings, Package, Truck } from 'lucide-react'

export default function PrintfulIntegrationPage({ params }: { params: { brand: string } }) {
  const [loading, setLoading] = useState(false)
  const [storeInfo, setStoreInfo] = useState<any>(null)
  const [webhooks, setWebhooks] = useState<any[]>([])
  const [syncStatus, setSyncStatus] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkPrintfulConnection()
    getWebhooks()
  }, [])

  const checkPrintfulConnection = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/printful/test')
      const data = await response.json()
      
      if (data.success) {
        setStoreInfo(data.store_info)
        setError(null)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to connect to Printful API')
    } finally {
      setLoading(false)
    }
  }

  const getWebhooks = async () => {
    try {
      const response = await fetch('/api/printful/webhook/setup')
      const data = await response.json()
      
      if (data.success) {
        setWebhooks(data.webhooks)
      }
    } catch (err) {
      console.error('Failed to get webhooks:', err)
    }
  }

  const syncProducts = async () => {
    try {
      setLoading(true)
      setSyncStatus(null)
      
      const response = await fetch(`/api/printful/sync?brand=${params.brand}`)
      const data = await response.json()
      
      setSyncStatus(data)
      
      if (!data.success) {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to sync products from Printful')
    } finally {
      setLoading(false)
    }
  }

  const setupWebhook = async () => {
    try {
      setLoading(true)
      
      // Use the current domain for webhook URL
      const webhookUrl = `${window.location.origin}/api/printful/webhook`
      
      const response = await fetch('/api/printful/webhook/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ webhookUrl }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert('Webhook setup successfully!')
        getWebhooks()
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to setup webhook')
    } finally {
      setLoading(false)
    }
  }

  const deleteWebhook = async (webhookId: string) => {
    try {
      const response = await fetch(`/api/printful/webhook/setup?id=${webhookId}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert('Webhook deleted successfully!')
        getWebhooks()
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to delete webhook')
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Printful Integration</h1>
        <p className="text-gray-600">
          Manage your Printful print-on-demand integration for {params.brand}
        </p>
      </div>

      {/* Connection Status */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Connection Status</h2>
          <button
            onClick={checkPrintfulConnection}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Test Connection</span>
          </button>
        </div>

        {error ? (
          <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        ) : storeInfo ? (
          <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg">
            <Check className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-green-800 font-medium">Connected to Printful</p>
              <p className="text-green-700 text-sm">
                Store: {storeInfo.name} (ID: {storeInfo.id})
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-gray-600">Click "Test Connection" to verify your Printful API credentials</p>
          </div>
        )}
      </div>

      {/* Product Sync */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Product Sync</span>
            </h2>
            <p className="text-gray-600 text-sm">Import products from your Printful store</p>
          </div>
          <button
            onClick={syncProducts}
            disabled={loading || !storeInfo}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Syncing...' : 'Sync Products'}</span>
          </button>
        </div>

        {syncStatus && (
          <div className={`p-4 rounded-lg ${syncStatus.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className={syncStatus.success ? 'text-green-800' : 'text-red-800'}>
              {syncStatus.message}
            </p>
            {syncStatus.success && (
              <div className="mt-2 text-sm text-green-700">
                <p>Synced: {syncStatus.synced_count} of {syncStatus.total_printful_products} products</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Webhook Management */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center space-x-2">
              <Truck className="w-5 h-5" />
              <span>Order Webhooks</span>
            </h2>
            <p className="text-gray-600 text-sm">Receive real-time updates for order fulfillment</p>
          </div>
          <button
            onClick={setupWebhook}
            disabled={loading || !storeInfo}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            <Settings className="w-4 h-4" />
            <span>Setup Webhook</span>
          </button>
        </div>

        {webhooks.length > 0 ? (
          <div className="space-y-2">
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{webhook.url}</p>
                  <p className="text-sm text-gray-600">
                    Events: {webhook.types?.join(', ') || 'All'}
                  </p>
                </div>
                <button
                  onClick={() => deleteWebhook(webhook.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-gray-600">No webhooks configured. Set up a webhook to receive order updates.</p>
          </div>
        )}
      </div>

      {/* Setup Instructions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Setup Instructions</h2>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-medium text-gray-900">1. Printful API Credentials</h3>
            <p className="text-gray-600">
              Add your Printful API token and store ID to your environment variables:
            </p>
            <div className="mt-2 p-3 bg-gray-50 border rounded font-mono text-xs">
              PRINTFUL_API_TOKEN=your_token_here<br />
              PRINTFUL_STORE_ID=your_store_id_here<br />
              PRINTFUL_WEBHOOK_SECRET=your_webhook_secret
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900">2. Product Sync</h3>
            <p className="text-gray-600">
              Click "Sync Products" to import all your Printful products into this brand's catalog.
              Products will be marked as "Print-on-Demand" type.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900">3. Order Fulfillment</h3>
            <p className="text-gray-600">
              When customers place orders containing Printful products, they will automatically be 
              sent to Printful for printing and shipping.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900">4. Webhook Setup</h3>
            <p className="text-gray-600">
              Set up webhooks to receive real-time updates about order status, tracking info, and shipment notifications.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t">
          <a
            href="https://developers.printful.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Printful API Documentation</span>
          </a>
        </div>
      </div>
    </div>
  )
}
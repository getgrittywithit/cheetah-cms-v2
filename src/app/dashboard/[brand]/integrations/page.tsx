'use client'

import Link from 'next/link'
import { ArrowRight, Package, Zap, Globe, Truck, CreditCard, Mail } from 'lucide-react'

export default function IntegrationsPage({ params }: { params: { brand: string } }) {
  const integrations = [
    {
      name: 'Printful',
      description: 'Print-on-demand fulfillment for custom products',
      status: 'available',
      icon: Package,
      href: `/dashboard/${params.brand}/integrations/printful`,
      color: 'bg-purple-100 text-purple-800',
      features: ['Product sync', 'Order fulfillment', 'Inventory management']
    },
    {
      name: 'Shopify',
      description: 'Sync products and orders with Shopify store',
      status: 'coming_soon',
      icon: Globe,
      href: '#',
      color: 'bg-green-100 text-green-800',
      features: ['Product sync', 'Order sync', 'Inventory sync']
    },
    {
      name: 'Stripe',
      description: 'Payment processing for online orders',
      status: 'coming_soon',
      icon: CreditCard,
      href: '#',
      color: 'bg-blue-100 text-blue-800',
      features: ['Payment processing', 'Subscription billing', 'Refunds']
    },
    {
      name: 'Shippo',
      description: 'Shipping labels and tracking for handmade products',
      status: 'coming_soon',
      icon: Truck,
      href: '#',
      color: 'bg-orange-100 text-orange-800',
      features: ['Shipping labels', 'Rate comparison', 'Tracking']
    },
    {
      name: 'Mailchimp',
      description: 'Email marketing and customer communication',
      status: 'coming_soon',
      icon: Mail,
      href: '#',
      color: 'bg-yellow-100 text-yellow-800',
      features: ['Email campaigns', 'Customer segments', 'Automation']
    },
    {
      name: 'Zapier',
      description: 'Connect with thousands of apps and automation',
      status: 'coming_soon',
      icon: Zap,
      href: '#',
      color: 'bg-indigo-100 text-indigo-800',
      features: ['Automation', 'Triggers', 'Custom workflows']
    }
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Integrations</h1>
        <p className="text-gray-600">
          Connect your {params.brand} store with powerful third-party services
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <div
            key={integration.name}
            className="bg-white rounded-lg shadow-sm border hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${integration.color}`}>
                    <integration.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      {integration.status === 'available' ? (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          Available
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                          Coming Soon
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4">
                {integration.description}
              </p>

              {/* Features */}
              <div className="mb-4">
                <h4 className="text-xs font-medium text-gray-900 mb-2 uppercase tracking-wide">
                  Features
                </h4>
                <ul className="space-y-1">
                  {integration.features.map((feature, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action */}
              <div className="pt-4 border-t">
                {integration.status === 'available' ? (
                  <Link
                    href={integration.href}
                    className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Configure Integration
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                ) : (
                  <button
                    disabled
                    className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed"
                  >
                    Coming Soon
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Help Section */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h2>
        <p className="text-gray-600 mb-4">
          Having trouble with an integration or need a custom solution? We're here to help.
        </p>
        <div className="flex space-x-4">
          <a
            href="#"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            View Documentation
          </a>
          <a
            href="#"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}
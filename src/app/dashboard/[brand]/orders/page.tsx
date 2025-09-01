'use client'

import { useState, useEffect } from 'react'
import { Package, Search, Filter, Eye, Mail, Truck, CheckCircle, XCircle, Clock } from 'lucide-react'
import { getBrandConfig } from '@/lib/brand-config'

interface Order {
  id: string
  customer_name: string
  customer_email: string
  total_amount: number
  currency: string
  status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded' | 'fulfilled'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  fulfillment_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  items: Array<{
    product_name: string
    product_type: string
    quantity: number
    price: number
  }>
  created_at: string
  stripe_session_id?: string
}

export default function OrdersPage({ params }: { params: { brand: string } }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  const brandConfig = getBrandConfig(params.brand)

  useEffect(() => {
    fetchOrders()
  }, [params.brand])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/brands/${params.brand}/orders`)
      const data = await response.json()
      if (data.success && data.orders) {
        setOrders(data.orders)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'shipped':
        return <Truck className="w-4 h-4 text-blue-600" />
      case 'processing':
        return <Package className="w-4 h-4 text-yellow-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'shipped':
        return 'bg-blue-100 text-blue-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filter === 'all' || order.status === filter
    
    return matchesSearch && matchesFilter
  })

  if (!brandConfig) {
    return <div>Brand not found</div>
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{brandConfig.name} Orders</h1>
        <p className="text-gray-600">Manage and track your customer orders</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer, email, or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        #{order.id.substring(0, 8)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{order.customer_name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{order.customer_email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.items.map(item => item.product_name).join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        ${order.total_amount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Send Email"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Orders will appear here when customers make purchases.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
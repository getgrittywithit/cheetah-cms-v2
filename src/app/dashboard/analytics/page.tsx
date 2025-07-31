'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Users, DollarSign, Eye, Calendar } from 'lucide-react'

interface AnalyticsData {
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
  totalViews: number
  orderGrowth: number
  revenueGrowth: number
  customerGrowth: number
  viewsGrowth: number
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Simulate analytics data - replace with real API calls
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setAnalytics({
          totalOrders: 147,
          totalRevenue: 12450,
          totalCustomers: 89,
          totalViews: 3420,
          orderGrowth: 12.5,
          revenueGrowth: 8.3,
          customerGrowth: 15.2,
          viewsGrowth: 22.1
        })
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [selectedPeriod])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Track your business performance and growth</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as '7d' | '30d' | '90d')}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.totalOrders}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+{analytics?.orderGrowth}%</span>
            <span className="text-sm text-gray-500 ml-2">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${analytics?.totalRevenue?.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+{analytics?.revenueGrowth}%</span>
            <span className="text-sm text-gray-500 ml-2">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.totalCustomers}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+{analytics?.customerGrowth}%</span>
            <span className="text-sm text-gray-500 ml-2">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Page Views</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.totalViews?.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Eye className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+{analytics?.viewsGrowth}%</span>
            <span className="text-sm text-gray-500 ml-2">vs last period</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            Revenue Trends
          </h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>Chart visualization coming soon</p>
              <p className="text-sm">Will show revenue trends over time</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-purple-600" />
            Customer Growth
          </h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>Chart visualization coming soon</p>
              <p className="text-sm">Will show customer acquisition trends</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Top Performing Products</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Product analysis</span>
                <span className="text-gray-500">Coming soon</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Customer Segments</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Segment analysis</span>
                <span className="text-gray-500">Coming soon</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Marketing Performance</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Campaign metrics</span>
                <span className="text-gray-500">Coming soon</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
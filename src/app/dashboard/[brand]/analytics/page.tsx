import { getBrandConfig } from '@/lib/brand-config'
import { notFound } from 'next/navigation'
import { 
  TrendingUp,
  BarChart3,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react'

interface BrandAnalyticsPageProps {
  params: { brand: string }
}

export default function BrandAnalyticsPage({ params }: BrandAnalyticsPageProps) {
  const { brand } = params
  const brandConfig = getBrandConfig(brand)
  
  if (!brandConfig) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Brand Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl font-bold"
              style={{ backgroundColor: brandConfig.theme.primary }}
            >
              {brandConfig.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600">Performance insights for {brandConfig.name}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-3xl font-bold text-gray-900">142</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">
            <span className="font-medium">+12%</span> from last month
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reach</p>
              <p className="text-3xl font-bold text-gray-900">24.5K</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">
            <span className="font-medium">+8%</span> from last month
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Engagement</p>
              <p className="text-3xl font-bold text-gray-900">3.2K</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-red-600 mt-2">
            <span className="font-medium">-2%</span> from last month
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Followers</p>
              <p className="text-3xl font-bold text-gray-900">1.8K</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">
            <span className="font-medium">+15%</span> from last month
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Engagement Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Engagement Over Time</h3>
            <button className="text-gray-400 hover:text-gray-600">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">Chart Coming Soon</p>
              <p className="text-sm">Engagement metrics will be displayed here</p>
            </div>
          </div>
        </div>

        {/* Platform Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Platform Performance</h3>
            <select className="text-sm border border-gray-300 rounded px-3 py-1">
              <option>Last 30 days</option>
              <option>Last 7 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                </div>
                <span className="font-medium text-gray-900">Facebook</span>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">12.3K</p>
                <p className="text-sm text-gray-500">reach</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-pink-600 rounded"></div>
                </div>
                <span className="font-medium text-gray-900">Instagram</span>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">8.7K</p>
                <p className="text-sm text-gray-500">reach</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-sky-600 rounded"></div>
                </div>
                <span className="font-medium text-gray-900">Twitter</span>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">3.5K</p>
                <p className="text-sm text-gray-500">reach</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Posts Performance */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Posts Performance</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All Posts
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Post</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Platform</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Reach</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Engagement</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50">
                <td className="py-4 px-4">
                  <p className="font-medium text-gray-900">Quick Garlic Pasta Recipe</p>
                  <p className="text-sm text-gray-500">🍝 Ready in 15 minutes\!</p>
                </td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Facebook
                  </span>
                </td>
                <td className="py-4 px-4 text-sm text-gray-600">Dec 25, 2024</td>
                <td className="py-4 px-4 text-sm text-gray-900">2.1K</td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Heart className="w-4 h-4 mr-1" />
                      89
                    </span>
                    <span className="flex items-center">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      12
                    </span>
                    <span className="flex items-center">
                      <Share2 className="w-4 h-4 mr-1" />
                      7
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View Details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
EOF < /dev/null
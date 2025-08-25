'use client'

import { useEffect, useState } from 'react'
import { 
  FileText, 
  Users, 
  Eye, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Calendar,
  Share2
} from 'lucide-react'

interface DashboardStats {
  totalPosts: number
  totalViews: number
  socialFollowers: number
  engagementRate: number
  systemStatus: boolean
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    totalViews: 0,
    socialFollowers: 0,
    engagementRate: 0,
    systemStatus: true
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Simulate loading content stats
      // In real implementation, this would fetch from your content API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setStats({
        totalPosts: 24,
        totalViews: 15420,
        socialFollowers: 3840,
        engagementRate: 4.2,
        systemStatus: true
      })
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      name: 'Content Posts',
      value: stats.totalPosts,
      icon: FileText,
      color: 'bg-blue-500',
      change: `${stats.totalPosts} published`
    },
    {
      name: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      color: 'bg-green-500',
      change: 'This month'
    },
    {
      name: 'Social Followers',
      value: stats.socialFollowers.toLocaleString(),
      icon: Users,
      color: 'bg-purple-500',
      change: 'All platforms'
    },
    {
      name: 'Engagement Rate',
      value: `${stats.engagementRate}%`,
      icon: TrendingUp,
      color: 'bg-yellow-500',
      change: 'Average rate'
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Content Dashboard</h2>
        <p className="text-gray-700">Manage your content, track performance, and grow your audience.</p>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3">
          {stats.systemStatus ? (
            <>
              <CheckCircle className="w-6 h-6 text-green-500" />
              <span className="text-green-700 font-medium">All Systems Online</span>
              <span className="text-gray-700">• Content management is running smoothly</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-6 h-6 text-red-500" />
              <span className="text-red-700 font-medium">System Issues</span>
              <span className="text-gray-700">• Check integrations status</span>
            </>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-700">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
            <FileText className="w-6 h-6 text-blue-500 mb-2" />
            <h4 className="font-medium text-gray-900">Create Content</h4>
            <p className="text-sm text-gray-700">Write a new blog post or article</p>
          </button>
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
            <Share2 className="w-6 h-6 text-green-500 mb-2" />
            <h4 className="font-medium text-gray-900">Social Media</h4>
            <p className="text-sm text-gray-700">Schedule social media posts</p>
          </button>
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
            <TrendingUp className="w-6 h-6 text-purple-500 mb-2" />
            <h4 className="font-medium text-gray-900">Analytics</h4>
            <p className="text-sm text-gray-700">View content performance</p>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Blog post published</p>
              <p className="text-xs text-gray-700">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Share2 className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Social media post scheduled</p>
              <p className="text-xs text-gray-700">4 hours ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Analytics report generated</p>
              <p className="text-xs text-gray-700">Yesterday</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
import { getBrandConfig } from '@/lib/brand-config'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { 
  Sparkles,
  FolderOpen, 
  BarChart3,
  Settings,
  Calendar,
  Image as ImageIcon,
  TrendingUp,
  Users
} from 'lucide-react'

interface BrandDashboardProps {
  params: { brand: string }
}

export default function BrandDashboard({ params }: BrandDashboardProps) {
  const { brand } = params
  const brandConfig = getBrandConfig(brand)
  
  if (!brandConfig) {
    notFound()
  }

  const quickActions = [
    {
      title: 'Create Content',
      description: 'Generate AI-powered posts for social media',
      icon: Sparkles,
      href: `/dashboard/${brand}/content`,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600'
    },
    {
      title: 'Manage Files',
      description: 'Upload and organize media files',
      icon: FolderOpen,
      href: `/dashboard/${brand}/files`,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600'
    },
    {
      title: 'View Analytics',
      description: 'Track content performance and engagement',
      icon: BarChart3,
      href: `/dashboard/${brand}/analytics`,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600'
    },
    {
      title: 'Brand Settings',
      description: 'Configure brand voice, tokens, and preferences',
      icon: Settings,
      href: `/dashboard/${brand}/settings`,
      color: 'bg-gray-500',
      hoverColor: 'hover:bg-gray-600'
    }
  ]

  const stats = [
    {
      label: 'Posts This Month',
      value: '12',
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      label: 'Media Files',
      value: '48',
      icon: ImageIcon,
      color: 'text-green-600'
    },
    {
      label: 'Total Engagement',
      value: '1.2K',
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      label: 'Active Platforms',
      value: '3',
      icon: Users,
      color: 'text-orange-600'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Brand Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl font-bold"
            style={{ backgroundColor: brandConfig.theme.primary }}
          >
            {brandConfig.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{brandConfig.name}</h1>
            <p className="text-gray-600">{brandConfig.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>Industry: {brandConfig.industry}</span>
          <span>•</span>
          <span>Bucket: {brandConfig.bucket}</span>
          <span>•</span>
          <span>Target: {brandConfig.targetAudience}</span>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${stat.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className={`${action.color} ${action.hoverColor} text-white rounded-lg p-6 transition-colors group`}
            >
              <div className="flex items-center justify-between mb-4">
                <action.icon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
              <p className="text-sm opacity-90">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-center py-8 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Recent activity will appear here</p>
          <p className="text-sm">Posts, uploads, and engagement metrics</p>
        </div>
      </div>
    </div>
  )
}
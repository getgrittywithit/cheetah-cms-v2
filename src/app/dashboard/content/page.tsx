'use client'

import { useState, useEffect } from 'react'
import { useBrand } from '@/contexts/brand-context'
import { 
  Sparkles,
  Calendar,
  BarChart3,
  Settings,
  ChevronDown,
  Plus,
  Clock,
  CheckCircle,
  TrendingUp,
  Instagram,
  Facebook,
  Twitter,
  Video,
  Youtube
} from 'lucide-react'
import AIPostCreator from '@/components/content/ai-post-creator'
import VideoCaptionCreator from '@/components/content/video-caption-creator'
import { SocialPost } from '@/lib/marketing-types'

const platformIcons = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  tiktok: Video,
  youtube: Youtube
}

const platformColors = {
  instagram: 'bg-pink-100 text-pink-600',
  facebook: 'bg-blue-100 text-blue-600',
  twitter: 'bg-sky-100 text-sky-600',
  tiktok: 'bg-black text-white',
  youtube: 'bg-red-100 text-red-600'
}

export default function ContentPage() {
  const { currentBrand, allBrands, switchBrand } = useBrand()
  const [activeView, setActiveView] = useState<'create' | 'video' | 'calendar' | 'analytics'>('create')
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showBrandSelector, setShowBrandSelector] = useState(false)

  const loadPosts = async () => {
    if (!currentBrand) return
    
    try {
      const response = await fetch(`/api/marketing/posts?brandId=${currentBrand.id}`)
      const data = await response.json()
      if (data.success) setSocialPosts(data.posts)
    } catch (error) {
      console.error('Failed to load posts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [currentBrand])

  const handleSchedulePost = async (post: any) => {
    if (!currentBrand) return
    
    try {
      // Handle hashtags properly - if it's already an array, keep it; if it's a string, split it
      const hashtags = Array.isArray(post.hashtags) 
        ? post.hashtags 
        : post.hashtags.split(' ').filter((tag: string) => tag.startsWith('#'))
      
      const response = await fetch('/api/marketing/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...post,
          brandId: currentBrand.id,
          hashtags: hashtags
        })
      })
      
      const data = await response.json()
      if (data.success) {
        await loadPosts()
        alert('Post scheduled successfully!')
      }
    } catch (error) {
      console.error('Failed to schedule post:', error)
    }
  }

  if (!currentBrand) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Choose Your Brand</h2>
          <p className="text-gray-700 mb-6">Select a brand to start creating amazing content</p>
          {allBrands.map(brand => (
            <button
              key={brand.id}
              onClick={() => switchBrand(brand.id)}
              className="w-full p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 text-left mb-2"
            >
              <div className="font-medium text-gray-900">{brand.name}</div>
              <div className="text-sm text-gray-700">{brand.industry}</div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  // Calculate stats
  const scheduledCount = socialPosts.filter(p => p.status === 'scheduled').length
  const publishedCount = socialPosts.filter(p => p.status === 'published').length
  const totalEngagement = socialPosts.reduce((sum, post) => {
    if (post.engagementStats) {
      return sum + post.engagementStats.likes + post.engagementStats.comments + post.engagementStats.shares
    }
    return sum
  }, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Content-Focused Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setShowBrandSelector(!showBrandSelector)}
                  className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {currentBrand.name.charAt(0)}
                    </span>
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{currentBrand.name}</div>
                    <div className="text-xs text-gray-700">{currentBrand.industry}</div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>

                {showBrandSelector && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-64">
                    {allBrands.map(brand => (
                      <button
                        key={brand.id}
                        onClick={() => {
                          switchBrand(brand.id)
                          setShowBrandSelector(false)
                        }}
                        className="w-full p-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                      >
                        <div className="font-medium text-gray-900">{brand.name}</div>
                        <div className="text-sm text-gray-700">{brand.industry}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {currentBrand.socialAccounts
                  .filter(acc => acc.isActive)
                  .map((account) => {
                    const Icon = platformIcons[account.platform as keyof typeof platformIcons]
                    return (
                      <div
                        key={account.platform}
                        className={`p-2 rounded ${platformColors[account.platform as keyof typeof platformColors]}`}
                        title={`${account.platform} connected`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                    )
                  })}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Quick Stats */}
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="text-gray-700">{scheduledCount} scheduled</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-gray-700">{publishedCount} published</span>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  <span className="text-gray-700">{totalEngagement} engagement</span>
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveView('create')}
                  className={`px-3 py-1.5 rounded text-sm font-medium ${
                    activeView === 'create'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  <Sparkles className="w-4 h-4 inline mr-1" />
                  Create
                </button>
                {currentBrand.slug === 'grit-collective-co.' && (
                  <button
                    onClick={() => setActiveView('video')}
                    className={`px-3 py-1.5 rounded text-sm font-medium ${
                      activeView === 'video'
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    <Video className="w-4 h-4 inline mr-1" />
                    Video
                  </button>
                )}
                <button
                  onClick={() => setActiveView('calendar')}
                  className={`px-3 py-1.5 rounded text-sm font-medium ${
                    activeView === 'calendar'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Calendar
                </button>
                <button
                  onClick={() => setActiveView('analytics')}
                  className={`px-3 py-1.5 rounded text-sm font-medium ${
                    activeView === 'analytics'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 inline mr-1" />
                  Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeView === 'create' && (
          <div className="max-w-4xl">
            <AIPostCreator 
              brandName={currentBrand.name}
              onSchedulePost={handleSchedulePost}
            />
          </div>
        )}

        {activeView === 'video' && (
          <div className="max-w-4xl">
            <VideoCaptionCreator 
              brandName={currentBrand.name}
              brandGuidelines={currentBrand.guidelines}
            />
          </div>
        )}

        {activeView === 'calendar' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-6">Content Calendar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {socialPosts.map(post => {
                const Icon = platformIcons[post.platform as keyof typeof platformIcons]
                return (
                  <div key={post.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-1.5 rounded ${platformColors[post.platform as keyof typeof platformColors]}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        post.status === 'published' 
                          ? 'bg-green-100 text-green-800'
                          : post.status === 'scheduled'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {post.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 mb-2 line-clamp-3">{post.content}</p>
                    <p className="text-xs text-gray-600">
                      {post.scheduledFor 
                        ? new Date(post.scheduledFor).toLocaleDateString()
                        : new Date(post.createdAt).toLocaleDateString()
                      }
                    </p>
                  </div>
                )
              })}
              {socialPosts.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-700">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No content scheduled yet</p>
                  <p className="text-sm">Create your first post to get started</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === 'analytics' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-6">Analytics Dashboard</h2>
            <div className="text-center py-12 text-gray-700">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Analytics coming soon!</p>
              <p className="text-sm">Track your content performance and engagement</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { getBrandConfig } from '@/lib/brand-config'
import { notFound } from 'next/navigation'
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
  Youtube,
  Edit
} from 'lucide-react'
import AIPostCreator from '@/components/content/ai-post-creator'
import VideoCaptionCreator from '@/components/content/video-caption-creator'
import DraftEditModal from '@/components/content/draft-edit-modal'
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

interface BrandContentPageProps {
  params: { brand: string }
}

export default function BrandContentPage({ params }: BrandContentPageProps) {
  const { brand } = params
  const brandConfig = getBrandConfig(brand)
  
  if (!brandConfig) {
    notFound()
  }

  const [activeView, setActiveView] = useState<'create' | 'video' | 'calendar' | 'analytics'>('create')
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDraft, setSelectedDraft] = useState<SocialPost | null>(null)
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false)

  const loadPosts = async () => {
    try {
      // Use brand-specific API call
      const response = await fetch(`/api/marketing/posts?brandSlug=${brand}`)
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
  }, [brand])

  const handleSchedulePost = async (post: any) => {
    try {
      // Handle hashtags properly
      const hashtags = Array.isArray(post.hashtags) 
        ? post.hashtags 
        : post.hashtags.split(' ').filter((tag: string) => tag.startsWith('#'))

      // Check if this is a multi-platform request
      const isMultiPlatform = post.selectedPlatforms && post.selectedPlatforms.length > 1
      
      if (isMultiPlatform) {
        // Use new multi-platform endpoint
        const publishResponse = await fetch('/api/marketing/publish-multi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platforms: post.selectedPlatforms,
            content: post.content,
            hashtags: hashtags.join(' '),
            scheduledFor: post.scheduledFor,
            imageUrl: post.imageUrl,
            isImmediate: post.isImmediate,
            brandSlug: brand
          })
        })

        const publishData = await publishResponse.json()
        
        if (publishData.success) {
          const successCount = publishData.results.filter(r => r.success).length
          const failureCount = publishData.results.filter(r => !r.success).length
          
          if (post.isImmediate) {
            alert(`Posted to ${successCount} platform(s) successfully! ${failureCount > 0 ? `${failureCount} failed.` : ''} 🎉`)
          } else {
            alert(`Scheduled for ${successCount} platform(s) successfully! ${failureCount > 0 ? `${failureCount} failed.` : ''} ⏰`)
          }
          await loadPosts()
        } else {
          console.error('Multi-platform publishing/scheduling failed:', publishData.error)
          alert(`Failed to ${post.isImmediate ? 'publish' : 'schedule'} to multiple platforms: ${publishData.error}`)
        }
      } else {
        // Single platform - use existing endpoint
        const socialPost = {
          platform: post.platform,
          content: post.content,
          hashtags: hashtags.join(' '),
          scheduledFor: post.scheduledFor
        }

        const mediaUrls = post.imageUrl ? [post.imageUrl] : []

        const publishResponse = await fetch('/api/marketing/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            post: socialPost,
            brand: {
              ...brandConfig,
              userId: 'admin'
            },
            mediaUrls: mediaUrls
          })
        })

        const publishData = await publishResponse.json()
        
        if (publishData.success) {
          if (post.isImmediate) {
            console.log('Successfully published immediately!')
            alert('Post published successfully! 🎉')
          } else {
            console.log('Successfully scheduled post!')
            alert(`Post scheduled for ${new Date(post.scheduledFor).toLocaleString()}! ⏰`)
          }
          await loadPosts()
        } else {
          console.error('Publishing/scheduling failed:', publishData.error)
          alert(`Failed to ${post.isImmediate ? 'publish' : 'schedule'} post: ${publishData.error}`)
        }
      }
      
    } catch (error) {
      console.error('Failed to handle post:', error)
      alert('Failed to process post. Please try again.')
    }
  }

  const handlePublishNow = async (post: any) => {
    try {
      console.log('Publishing draft post to Facebook...', post)
      
      const socialPost = {
        id: post.id,
        platform: post.platform,
        content: post.content,
        hashtags: post.hashtags,
        scheduledFor: null
      }

      const mediaUrls = post.media || []

      const publishResponse = await fetch('/api/marketing/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post: socialPost,
          brand: brandConfig, // Use brandConfig
          mediaUrls: mediaUrls
        })
      })

      const publishData = await publishResponse.json()
      console.log('Publish response:', publishData)
      
      if (publishData.success) {
        alert('Post published to Facebook successfully! 🎉')
        await loadPosts()
      } else {
        alert(`Publishing failed: ${publishData.error}`)
      }
      
    } catch (error) {
      console.error('Failed to publish post:', error)
      alert('Failed to publish post. Check console for details.')
    }
  }

  // Calculate stats
  const totalPosts = socialPosts.length
  const scheduledPosts = socialPosts.filter(post => post.status === 'scheduled').length
  const publishedPosts = socialPosts.filter(post => post.status === 'published').length
  const totalEngagement = socialPosts.reduce((sum, post) => sum + (post.engagement || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Brand Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-bold"
                style={{ backgroundColor: brandConfig.theme.primary }}
              >
                {brandConfig.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{brandConfig.name}</h1>
                <p className="text-sm text-gray-600">Content Management</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-xl font-semibold text-gray-900">{totalPosts}</div>
                <div className="text-xs text-gray-700">Total Posts</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-green-600">{publishedPosts}</div>
                <div className="text-xs text-gray-700">Published</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-yellow-600">{scheduledPosts}</div>
                <div className="text-xs text-gray-700">Scheduled</div>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                <span className="text-gray-700">{totalEngagement} engagement</span>
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
                {brandConfig.slug === 'grit-collective' && (
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
              brandName={brandConfig.name}
              brandSlug={brandConfig.slug}
              onSchedulePost={handleSchedulePost}
            />
          </div>
        )}

        {activeView === 'video' && (
          <div className="max-w-4xl">
            <VideoCaptionCreator 
              brandName={brandConfig.name}
              brandGuidelines={{
                voice: { tone: brandConfig.aiSettings.voice, personality: brandConfig.aiSettings.personality, doNots: [] },
                visual: { primaryColors: [brandConfig.theme.primary], secondaryColors: [], fontStyle: '' },
                content: { hashtags: [], keywords: [], contentPillars: [], postingSchedule: [] },
                aiPrompt: brandConfig.aiSettings.systemPrompt
              }}
            />
          </div>
        )}

        {activeView === 'calendar' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Content Calendar</h2>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => window.location.href = '/api/debug/brand-social'}
                  className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                >
                  🔧 Debug Brand Config
                </button>
                <button 
                  onClick={() => window.location.href = '/api/facebook/check-token'}
                  className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200"
                >
                  🔑 Check FB Token
                </button>
              </div>
            </div>
            
            {/* Status Filter Tabs */}
            <div className="flex items-center space-x-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
              {['all', 'draft', 'scheduled', 'published'].map(status => (
                <button
                  key={status}
                  className={`px-3 py-1.5 rounded text-sm font-medium capitalize ${
                    'all' === status
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  {status} ({status === 'all' ? socialPosts.length : socialPosts.filter(p => p.status === status).length})
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {socialPosts.map(post => {
                const Icon = platformIcons[post.platform as keyof typeof platformIcons]
                return (
                  <div 
                    key={post.id} 
                    className={`p-4 border rounded-lg transition-all ${
                      post.status === 'draft' 
                        ? 'border-gray-200 hover:border-blue-400 hover:shadow-md cursor-pointer bg-white hover:bg-blue-50/30' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      if (post.status === 'draft') {
                        setSelectedDraft(post)
                        setIsDraftModalOpen(true)
                      }
                    }}
                  >
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
                    
                    <p className="text-sm text-gray-900 mb-3 line-clamp-3">{post.content}</p>
                    
                    <div className="text-xs text-gray-600 mb-3">
                      {post.scheduledFor 
                        ? `Scheduled: ${new Date(post.scheduledFor).toLocaleString()}`
                        : `Created: ${new Date(post.createdAt).toLocaleDateString()}`
                      }
                    </div>

                    {/* Action Buttons */}
                    {post.status === 'draft' && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 font-medium">Click to edit</span>
                        <Edit className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                    
                    {post.status === 'scheduled' && (
                      <div className="flex items-center space-x-2">
                        <button className="flex-1 bg-yellow-600 text-white text-xs px-3 py-1.5 rounded hover:bg-yellow-700">
                          Edit Schedule
                        </button>
                        <button className="text-gray-600 hover:text-gray-800 p-1">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    
                    {post.status === 'published' && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-green-600 font-medium">✓ Live</span>
                        <button className="text-gray-600 hover:text-gray-800 p-1">
                          <BarChart3 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
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

      {/* Draft Edit Modal */}
      {selectedDraft && (
        <DraftEditModal
          isOpen={isDraftModalOpen}
          onClose={() => {
            setIsDraftModalOpen(false)
            setSelectedDraft(null)
          }}
          post={selectedDraft}
          onUpdate={async (postId, updates) => {
            // Update the post in the database
            const response = await fetch('/api/marketing/posts', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: postId, ...updates })
            })
            if (response.ok) {
              await loadPosts()
            } else {
              throw new Error('Failed to update post')
            }
          }}
          onDelete={async (postId) => {
            // Delete the post from the database
            const response = await fetch('/api/marketing/posts', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: postId })
            })
            if (response.ok) {
              await loadPosts()
            } else {
              throw new Error('Failed to delete post')
            }
          }}
          onPublish={async (post, scheduledFor) => {
            // Use the existing handleSchedulePost function
            await handleSchedulePost({
              ...post,
              scheduledFor,
              isImmediate: !scheduledFor
            })
            await loadPosts()
          }}
        />
      )}
    </div>
  )
}
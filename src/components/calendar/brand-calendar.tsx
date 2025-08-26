'use client'

import { useState, useEffect } from 'react'
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Filter,
  Clock,
  Eye,
  Edit,
  Trash2,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  FileImage,
  MoreHorizontal,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { BrandConfig } from '@/lib/brand-config'
import { getAllPlatforms } from '@/lib/platform-config'
import PostDetailModal from './post-detail-modal'

interface ScheduledPost {
  id: string
  title: string
  content: string
  platform: string
  scheduledDate: Date
  status: 'scheduled' | 'published' | 'failed'
  media: string[]
  hashtags: string[]
  createdAt: Date
}

interface BrandCalendarProps {
  brandConfig: BrandConfig
}

type ViewMode = 'month' | 'week'

const platformIcons = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
  tiktok: FileImage, // Using FileImage as placeholder for TikTok
  pinterest: FileImage,
  linkedin: FileImage
}

const platformColors = {
  facebook: '#1877F2',
  instagram: '#E4405F', 
  twitter: '#1DA1F2',
  youtube: '#FF0000',
  tiktok: '#000000',
  pinterest: '#E60023',
  linkedin: '#0077B5'
}

export default function BrandCalendar({ brandConfig }: BrandCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['all'])
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null)
  const [showPostModal, setShowPostModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const availablePlatforms = getAllPlatforms()

  useEffect(() => {
    loadScheduledPosts()
  }, [currentDate, selectedPlatforms, viewMode])

  const loadScheduledPosts = async () => {
    setLoading(true)
    setError(null)
    try {
      // Calculate date range based on view mode
      const startDate = viewMode === 'month' ? getMonthStart(currentDate) : getWeekStart(currentDate)
      const endDate = viewMode === 'month' ? getMonthEnd(currentDate) : getWeekEnd(currentDate)
      
      const response = await fetch(`/api/marketing/posts?brandId=${brandConfig.slug}&status=scheduled&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
      
      if (!response.ok) {
        if (response.status === 500) {
          throw new Error('Server error occurred while loading scheduled posts. Please try again later.')
        } else if (response.status === 404) {
          throw new Error('Calendar data not found. Please check your brand configuration.')
        } else {
          throw new Error(`Failed to load scheduled posts (${response.status}). Please try again.`)
        }
      }
      
      const data = await response.json()
      
      if (data.success) {
        const posts: ScheduledPost[] = data.posts.map((post: any) => ({
          id: post.id,
          title: post.content.substring(0, 50) + '...',
          content: post.content,
          platform: post.platform,
          scheduledDate: new Date(post.scheduledFor),
          status: post.status,
          media: post.media || [],
          hashtags: post.hashtags || [],
          createdAt: new Date(post.createdAt)
        }))
        setScheduledPosts(posts)
      } else {
        throw new Error(data.error || 'Unknown error occurred while loading scheduled posts')
      }
    } catch (error) {
      console.error('Failed to load scheduled posts:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred while loading scheduled posts')
      setScheduledPosts([]) // Clear any existing posts
    } finally {
      setLoading(false)
    }
  }

  const retryLoadPosts = () => {
    loadScheduledPosts()
  }

  const getMonthStart = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1)
  }

  const getMonthEnd = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0)
  }

  const getWeekStart = (date: Date) => {
    const start = new Date(date)
    const day = start.getDay()
    const diff = start.getDate() - day
    return new Date(start.setDate(diff))
  }

  const getWeekEnd = (date: Date) => {
    const start = getWeekStart(date)
    return new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000)
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    }
    setCurrentDate(newDate)
    setError(null) // Clear error when user navigates
  }

  const togglePlatformFilter = (platformId: string) => {
    if (platformId === 'all') {
      setSelectedPlatforms(['all'])
    } else {
      setSelectedPlatforms(prev => {
        const filtered = prev.filter(p => p !== 'all')
        return filtered.includes(platformId)
          ? filtered.filter(p => p !== platformId)
          : [...filtered, platformId]
      })
    }
  }

  const filteredPosts = scheduledPosts.filter(post => {
    if (selectedPlatforms.includes('all')) return true
    return selectedPlatforms.includes(post.platform)
  })

  const getPostsForDate = (date: Date) => {
    return filteredPosts.filter(post => 
      post.scheduledDate.toDateString() === date.toDateString()
    )
  }

  const openPostModal = (post: ScheduledPost) => {
    setSelectedPost(post)
    setShowPostModal(true)
  }

  const renderMonthView = () => {
    const start = getMonthStart(currentDate)
    const end = getMonthEnd(currentDate)
    const startDate = getWeekStart(start)
    const weeks = []
    let current = new Date(startDate)

    while (current <= end || current.getDay() !== 0) {
      const week = []
      for (let i = 0; i < 7; i++) {
        const date = new Date(current)
        const postsForDate = getPostsForDate(date)
        const isCurrentMonth = date.getMonth() === currentDate.getMonth()
        const isToday = date.toDateString() === new Date().toDateString()

        week.push(
          <div
            key={date.toISOString()}
            className={`min-h-[120px] border border-gray-200 p-2 ${
              isCurrentMonth ? 'bg-white' : 'bg-gray-50'
            } ${isToday ? 'bg-blue-50 border-blue-200' : ''}`}
          >
            <div className={`text-sm font-medium mb-2 ${
              isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
            } ${isToday ? 'text-blue-600' : ''}`}>
              {date.getDate()}
            </div>
            
            <div className="space-y-1">
              {postsForDate.slice(0, 3).map(post => {
                const Icon = platformIcons[post.platform as keyof typeof platformIcons]
                return (
                  <div
                    key={post.id}
                    onClick={() => openPostModal(post)}
                    className="text-xs p-1 rounded cursor-pointer hover:bg-gray-100 flex items-center space-x-1"
                    style={{ borderLeft: `3px solid ${platformColors[post.platform as keyof typeof platformColors]}` }}
                  >
                    <Icon className="w-3 h-3" />
                    <Clock className="w-3 h-3" />
                    <span className="truncate">
                      {post.scheduledDate.toTimeString().slice(0, 5)}
                    </span>
                  </div>
                )
              })}
              {postsForDate.length > 3 && (
                <div className="text-xs text-gray-500 p-1">
                  +{postsForDate.length - 3} more
                </div>
              )}
            </div>
          </div>
        )
        current.setDate(current.getDate() + 1)
      }
      weeks.push(week)
      
      if (current.getDay() === 0 && current > end) break
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Month Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-sm font-medium text-gray-600 text-center bg-gray-50">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {weeks.flat()}
        </div>
      </div>
    )
  }

  const renderWeekView = () => {
    const startDate = getWeekStart(currentDate)
    const days = []
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const postsForDate = getPostsForDate(date)
      const isToday = date.toDateString() === new Date().toDateString()

      days.push(
        <div key={i} className={`border-r border-gray-200 ${i === 6 ? 'border-r-0' : ''}`}>
          <div className={`p-3 border-b border-gray-200 text-center ${
            isToday ? 'bg-blue-50 text-blue-600' : 'bg-gray-50'
          }`}>
            <div className="text-sm font-medium">
              {date.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className={`text-lg font-semibold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
              {date.getDate()}
            </div>
          </div>
          
          <div className="p-3 min-h-[400px] space-y-2">
            {postsForDate.map(post => {
              const Icon = platformIcons[post.platform as keyof typeof platformIcons]
              return (
                <div
                  key={post.id}
                  onClick={() => openPostModal(post)}
                  className="p-3 rounded-lg cursor-pointer hover:bg-gray-50 border border-gray-200"
                  style={{ borderLeft: `4px solid ${platformColors[post.platform as keyof typeof platformColors]}` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <span className="text-xs font-medium text-gray-600 uppercase">
                        {post.platform}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {post.scheduledDate.toTimeString().slice(0, 5)}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-900 line-clamp-3 mb-2">
                    {post.content}
                  </p>
                  
                  {post.media.length > 0 && (
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <FileImage className="w-3 h-3" />
                      <span>{post.media.length} image{post.media.length > 1 ? 's' : ''}</span>
                    </div>
                  )}
                  
                  {post.hashtags.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {post.hashtags.slice(0, 3).join(' ')}
                      {post.hashtags.length > 3 && ' ...'}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Week Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">
            Week of {startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </h2>
        </div>

        {/* Week Grid */}
        <div className="grid grid-cols-7">
          {days}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Calendar Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          {/* View Toggle */}
          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => {
                setViewMode('month')
                setError(null) // Clear error when view mode changes
              }}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                viewMode === 'month' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => {
                setViewMode('week')
                setError(null) // Clear error when view mode changes
              }}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg border-l ${
                viewMode === 'week' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Week
            </button>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setCurrentDate(new Date())
                setError(null) // Clear error when navigating to today
              }}
              className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              Today
            </button>
            <button
              onClick={() => navigateDate('next')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Platform Filters */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <div className="flex items-center space-x-1">
            <button
              onClick={() => togglePlatformFilter('all')}
              className={`px-3 py-1 text-xs rounded-full ${
                selectedPlatforms.includes('all')
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {availablePlatforms.map(platform => {
              const Icon = platformIcons[platform.id as keyof typeof platformIcons] || FileImage
              const isSelected = selectedPlatforms.includes(platform.id)
              
              return (
                <button
                  key={platform.id}
                  onClick={() => togglePlatformFilter(platform.id)}
                  className={`flex items-center space-x-1 px-2 py-1 text-xs rounded-full ${
                    isSelected
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={{
                    backgroundColor: isSelected ? platform.color : undefined
                  }}
                >
                  <Icon className="w-3 h-3" />
                  <span className="hidden sm:inline">{platform.displayName}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Calendar View */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="text-center text-gray-600 flex items-center justify-center space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Loading calendar...</span>
          </div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-12">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Calendar</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={retryLoadPosts}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center space-x-2 bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <span>Reload Page</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        viewMode === 'month' ? renderMonthView() : renderWeekView()
      )}

      {/* Post Detail Modal */}
      {showPostModal && selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => {
            setShowPostModal(false)
            setSelectedPost(null)
          }}
          onEdit={(post) => {
            // Handle edit action
            console.log('Edit post:', post)
          }}
          onDelete={(postId) => {
            // Handle delete action
            console.log('Delete post:', postId)
            setScheduledPosts(prev => prev.filter(p => p.id !== postId))
            setShowPostModal(false)
            setSelectedPost(null)
          }}
        />
      )}
    </div>
  )
}
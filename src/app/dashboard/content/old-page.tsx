'use client'

import { useState, useEffect } from 'react'
import { useBrand } from '@/contexts/brand-context'
import { 
  Megaphone,
  Calendar,
  Instagram,
  Facebook,
  MessageCircle,
  Image,
  FileText,
  Send,
  Clock,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
  Hash,
  CheckCircle
} from 'lucide-react'
import { SocialPost, BlogPost } from '@/lib/marketing-types'
import ContentCalendar from '@/components/marketing/content-calendar'
import BlogCreator from './blog-creator'

// Platform icons mapping
const platformIcons = {
  instagram: Instagram,
  facebook: Facebook,
  tiktok: MessageCircle,
  pinterest: Image,
  twitter: Hash
}

const platformColors = {
  instagram: 'bg-pink-100 text-pink-600',
  facebook: 'bg-blue-100 text-blue-600',
  tiktok: 'bg-black text-white',
  pinterest: 'bg-red-100 text-red-600',
  twitter: 'bg-sky-100 text-sky-600'
}

export default function MarketingPage() {
  const { currentBrand } = useBrand()
  const [activeTab, setActiveTab] = useState<'overview' | 'social' | 'blog' | 'shopify-blog' | 'calendar' | 'email'>('overview')
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([])
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [showCreateBlog, setShowCreateBlog] = useState(false)
  const [, setSelectedPost] = useState<SocialPost | null>(null)
  const [,] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  // Form states
  const [postForm, setPostForm] = useState({
    platform: 'instagram' as SocialPost['platform'],
    content: '',
    hashtags: '',
    scheduledFor: ''
  })

  const [blogForm, setBlogForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    tags: '',
    status: 'draft' as BlogPost['status']
  })

  const loadMarketingData = async () => {
    if (!currentBrand) return
    
    try {
      const [socialRes, blogRes] = await Promise.all([
        fetch(`/api/marketing/posts?brandId=${currentBrand.id}`),
        fetch(`/api/marketing/blog?brandId=${currentBrand.id}`)
      ])
      
      const socialData = await socialRes.json()
      const blogData = await blogRes.json()
      
      if (socialData.success) setSocialPosts(socialData.posts)
      if (blogData.success) setBlogPosts(blogData.posts)
    } catch (error) {
      console.error('Failed to load marketing data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMarketingData()
  }, [currentBrand])

  const handleCreatePost = async () => {
    if (!currentBrand) return
    
    try {
      const response = await fetch('/api/marketing/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...postForm,
          brandId: currentBrand.id,
          hashtags: postForm.hashtags.split(' ').filter(tag => tag.startsWith('#'))
        })
      })
      
      const data = await response.json()
      if (data.success) {
        await loadMarketingData()
        setShowCreatePost(false)
        setPostForm({
          platform: 'instagram',
          content: '',
          hashtags: '',
          scheduledFor: ''
        })
      }
    } catch (error) {
      console.error('Failed to create post:', error)
    }
  }

  const handleCreateBlog = async () => {
    if (!currentBrand) return
    
    try {
      const response = await fetch('/api/marketing/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...blogForm,
          brandId: currentBrand.id,
          tags: blogForm.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        })
      })
      
      const data = await response.json()
      if (data.success) {
        await loadMarketingData()
        setShowCreateBlog(false)
        setBlogForm({
          title: '',
          content: '',
          excerpt: '',
          tags: '',
          status: 'draft'
        })
      }
    } catch (error) {
      console.error('Failed to create blog post:', error)
    }
  }

  const handleDeletePost = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return
    
    try {
      const response = await fetch('/api/marketing/posts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      
      if (response.ok) {
        await loadMarketingData()
      }
    } catch (error) {
      console.error('Failed to delete post:', error)
    }
  }

  // Calculate stats
  const scheduledCount = socialPosts.filter(p => p.status === 'scheduled').length
  const publishedCount = socialPosts.filter(p => p.status === 'published').length
  // const draftCount = socialPosts.filter(p => p.status === 'draft').length
  const totalEngagement = socialPosts.reduce((sum, post) => {
    if (post.engagementStats) {
      return sum + post.engagementStats.likes + post.engagementStats.comments + post.engagementStats.shares
    }
    return sum
  }, 0)

  // Publish post immediately
  const handlePublishPost = async (post: SocialPost) => {
    if (!currentBrand) return
    
    try {
      const response = await fetch('/api/marketing/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post,
          brand: currentBrand,
          mediaUrls: post.media
        })
      })
      
      const data = await response.json()
      if (data.success) {
        await loadMarketingData()
        alert(`Post ${data.status === 'scheduled' ? 'scheduled' : 'published'} successfully!`)
      } else {
        alert(`Failed to publish: ${data.error}`)
      }
    } catch (error) {
      console.error('Failed to publish post:', error)
      alert('Failed to publish post')
    }
  }

  if (!currentBrand) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500">Please select a brand to continue</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketing</h1>
          <p className="text-gray-600">
            Manage content for <span className="font-medium text-gray-900">{currentBrand.name}</span> • 
            {currentBrand.socialAccounts.filter(acc => acc.isActive).length} platforms connected
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {currentBrand.socialAccounts
            .filter(acc => acc.isActive)
            .map((account) => {
              const Icon = platformIcons[account.platform]
              return (
                <div
                  key={account.platform}
                  className={`p-2 rounded ${platformColors[account.platform]}`}
                  title={`${account.platform} connected`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              )
            })}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'social'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Social Media
          </button>
          <button
            onClick={() => setActiveTab('blog')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'blog'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Blog
          </button>
          <button
            onClick={() => setActiveTab('shopify-blog')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'shopify-blog'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Shopify Blog
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'calendar'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'email'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Email Campaigns
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Marketing Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Scheduled</p>
                  <p className="text-2xl font-semibold text-gray-900">{scheduledCount}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-2xl font-semibold text-gray-900">{publishedCount}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Engagement</p>
                  <p className="text-2xl font-semibold text-gray-900">{totalEngagement}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <FileText className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Blog Posts</p>
                  <p className="text-2xl font-semibold text-gray-900">{blogPosts.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Calendar Preview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Upcoming Content
            </h2>
            <div className="space-y-3">
              {socialPosts
                .filter(post => post.status === 'scheduled')
                .slice(0, 5)
                .map((post) => {
                  const Icon = platformIcons[post.platform]
                  return (
                    <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <div className={`p-2 rounded ${platformColors[post.platform]}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {post.content.substring(0, 50)}...
                          </p>
                          <p className="text-xs text-gray-500">
                            {post.scheduledFor && new Date(post.scheduledFor).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Scheduled
                      </span>
                    </div>
                  )
                })}
              {socialPosts.filter(post => post.status === 'scheduled').length === 0 && (
                <p className="text-center text-gray-500 py-4">No scheduled content</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'social' && (
        <div className="space-y-6">
          {/* Social Media Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Social Media Posts</h2>
            <button
              onClick={() => setShowCreatePost(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </button>
          </div>

          {/* Platform Filters */}
          <div className="flex items-center space-x-3">
            <button className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm">
              All Platforms
            </button>
            {Object.entries(platformIcons).map(([platform, Icon]) => (
              <button
                key={platform}
                className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg text-sm flex items-center"
              >
                <Icon className="w-4 h-4 mr-1" />
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </button>
            ))}
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {socialPosts.map((post) => {
              const Icon = platformIcons[post.platform]
              return (
                <div key={post.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2 rounded ${platformColors[post.platform]}`}>
                        <Icon className="w-5 h-5" />
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
                    
                    {post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.hashtags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="text-xs text-blue-600">
                            {tag}
                          </span>
                        ))}
                        {post.hashtags.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{post.hashtags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {post.scheduledFor 
                          ? `Scheduled: ${new Date(post.scheduledFor).toLocaleDateString()}`
                          : `Created: ${new Date(post.createdAt).toLocaleDateString()}`
                        }
                      </span>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedPost(post)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {post.status === 'draft' && (
                        <button
                          onClick={() => handlePublishPost(post)}
                          className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                        >
                          <Send className="w-3 h-3" />
                          <span>Publish Now</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            
            {socialPosts.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Megaphone className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No social media posts yet</p>
                <p className="text-sm text-gray-400">Create your first post to get started</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'blog' && (
        <div className="space-y-6">
          {/* Blog Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Blog Posts</h2>
            <button
              onClick={() => setShowCreateBlog(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Write Post
            </button>
          </div>

          {/* Blog Posts List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="divide-y divide-gray-200">
              {blogPosts.map((post) => (
                <div key={post.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{post.excerpt}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>By {post.author}</span>
                        <span>•</span>
                        <span>
                          {post.publishedAt 
                            ? new Date(post.publishedAt).toLocaleDateString()
                            : 'Draft'
                          }
                        </span>
                        <span>•</span>
                        <span>{post.views} views</span>
                      </div>
                      
                      {post.tags.length > 0 && (
                        <div className="flex items-center space-x-2 mt-2">
                          {post.tags.map((tag, index) => (
                            <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <span className={`text-xs px-2 py-1 rounded ${
                        post.status === 'published' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {post.status}
                      </span>
                      <button className="text-blue-600 hover:text-blue-700">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {blogPosts.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No blog posts yet</p>
                  <p className="text-sm text-gray-400">Write your first post to engage your audience</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <ContentCalendar 
            socialPosts={socialPosts}
            blogPosts={blogPosts}
          />
        </div>
      )}

      {activeTab === 'shopify-blog' && (
        <BlogCreator />
      )}

      {activeTab === 'email' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Send className="w-5 h-5 mr-2 text-purple-600" />
              Email Campaigns
            </h2>
            <div className="text-center py-12 text-gray-500">
              <Send className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Email campaigns coming soon!</p>
              <p className="text-sm">Connect your email service to start sending campaigns</p>
            </div>
          </div>
        </div>
      )}

      {/* Create Social Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Create Social Media Post</h2>
              <button
                onClick={() => setShowCreatePost(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Platform
                </label>
                <select
                  value={postForm.platform}
                  onChange={(e) => setPostForm({ ...postForm, platform: e.target.value as SocialPost['platform'] })}
                  className="w-full border-gray-300 rounded-md"
                >
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="tiktok">TikTok</option>
                  <option value="pinterest">Pinterest</option>
                  <option value="twitter">Twitter</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  value={postForm.content}
                  onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                  rows={4}
                  className="w-full border-gray-300 rounded-md"
                  placeholder="What's on your mind?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hashtags
                </label>
                <input
                  type="text"
                  value={postForm.hashtags}
                  onChange={(e) => setPostForm({ ...postForm, hashtags: e.target.value })}
                  className="w-full border-gray-300 rounded-md"
                  placeholder="#fashion #style #ootd"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Schedule For (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={postForm.scheduledFor}
                  onChange={(e) => setPostForm({ ...postForm, scheduledFor: e.target.value })}
                  className="w-full border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreatePost(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePost}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Blog Post Modal */}
      {showCreateBlog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Write Blog Post</h2>
              <button
                onClick={() => setShowCreateBlog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={blogForm.title}
                  onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                  className="w-full border-gray-300 rounded-md"
                  placeholder="Enter blog post title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  value={blogForm.content}
                  onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                  rows={10}
                  className="w-full border-gray-300 rounded-md"
                  placeholder="Write your blog post content..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Excerpt
                </label>
                <textarea
                  value={blogForm.excerpt}
                  onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                  rows={2}
                  className="w-full border-gray-300 rounded-md"
                  placeholder="Brief summary of your post"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={blogForm.tags}
                  onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value })}
                  className="w-full border-gray-300 rounded-md"
                  placeholder="fashion, style, tips"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={blogForm.status}
                  onChange={(e) => setBlogForm({ ...blogForm, status: e.target.value as BlogPost['status'] })}
                  className="w-full border-gray-300 rounded-md"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Publish Now</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateBlog(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBlog}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {blogForm.status === 'draft' ? 'Save Draft' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
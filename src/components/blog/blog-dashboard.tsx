'use client'

import { useState, useEffect } from 'react'
import { 
  PenTool, 
  Sparkles, 
  FileText, 
  Clock, 
  BarChart3, 
  Calendar,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Send
} from 'lucide-react'
import { BrandConfig } from '@/lib/brand-config'

interface BlogPost {
  id: string
  title: string
  content: string
  excerpt: string
  status: 'draft' | 'scheduled' | 'published'
  publishedAt?: Date
  scheduledFor?: Date
  tags: string[]
  wordCount: number
  readTime: number
  views?: number
  engagementRate?: number
}

interface BlogDashboardProps {
  brandConfig: BrandConfig
}

export default function BlogDashboard({ brandConfig }: BlogDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'manage'>('overview')
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'scheduled' | 'published'>('all')

  // AI Blog Creation State
  const [aiPrompt, setAiPrompt] = useState('')
  const [generatedContent, setGeneratedContent] = useState('')
  const [generating, setGenerating] = useState(false)
  const [blogTitle, setBlogTitle] = useState('')
  const [blogContent, setBlogContent] = useState('')
  const [blogExcerpt, setBlogExcerpt] = useState('')
  const [blogTags, setBlogTags] = useState('')
  const [publishDate, setPublishDate] = useState('')
  const [publishTime, setPublishTime] = useState('')

  useEffect(() => {
    loadBlogPosts()
  }, [])

  const loadBlogPosts = async () => {
    setLoading(true)
    try {
      // Mock data for now - replace with actual API call
      const mockPosts: BlogPost[] = [
        {
          id: '1',
          title: 'Building Mental Resilience Through Daily Challenges',
          content: 'In a world that constantly tests our limits...',
          excerpt: 'Discover how small daily challenges can build unbreakable mental strength.',
          status: 'published',
          publishedAt: new Date('2025-01-15'),
          tags: ['mindset', 'resilience', 'growth'],
          wordCount: 1250,
          readTime: 5,
          views: 1240,
          engagementRate: 8.3
        },
        {
          id: '2', 
          title: 'The Power of Morning Routines for Peak Performance',
          content: 'How you start your day determines...',
          excerpt: 'Transform your mornings to unlock your highest potential.',
          status: 'scheduled',
          scheduledFor: new Date('2025-01-20'),
          tags: ['morning-routine', 'productivity', 'habits'],
          wordCount: 980,
          readTime: 4
        }
      ]
      setPosts(mockPosts)
    } catch (error) {
      console.error('Failed to load blog posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateBlogWithAI = async () => {
    if (!aiPrompt.trim()) return
    
    setGenerating(true)
    try {
      const response = await fetch('/api/ai/blog-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          brand: brandConfig.slug,
          tone: brandConfig.voice || 'motivational and inspiring'
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setBlogTitle(data.title)
        setBlogContent(data.content)
        setBlogExcerpt(data.excerpt)
        setBlogTags(data.tags.join(', '))
        setGeneratedContent(data.content)
      } else {
        alert('Failed to generate blog content: ' + data.error)
      }
    } catch (error) {
      console.error('AI generation error:', error)
      alert('Failed to generate blog content')
    } finally {
      setGenerating(false)
    }
  }

  const saveBlogPost = async (status: 'draft' | 'scheduled' | 'published') => {
    if (!blogTitle || !blogContent) {
      alert('Title and content are required')
      return
    }

    try {
      const scheduledFor = status === 'scheduled' && publishDate && publishTime 
        ? new Date(`${publishDate}T${publishTime}`)
        : undefined

      const response = await fetch('/api/blog/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: blogTitle,
          content: blogContent,
          excerpt: blogExcerpt,
          tags: blogTags.split(',').map(tag => tag.trim()),
          status,
          scheduledFor,
          brandId: brandConfig.slug
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert(`Blog post ${status === 'published' ? 'published' : 'saved'} successfully!`)
        setBlogTitle('')
        setBlogContent('')
        setBlogExcerpt('')
        setBlogTags('')
        setPublishDate('')
        setPublishTime('')
        loadBlogPosts()
        setActiveTab('manage')
      } else {
        alert('Failed to save blog post: ' + data.error)
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save blog post')
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    totalPosts: posts.length,
    drafts: posts.filter(p => p.status === 'draft').length,
    scheduled: posts.filter(p => p.status === 'scheduled').length,
    published: posts.filter(p => p.status === 'published').length,
    totalViews: posts.reduce((sum, p) => sum + (p.views || 0), 0),
    avgEngagement: posts.filter(p => p.engagementRate).reduce((sum, p) => sum + (p.engagementRate || 0), 0) / posts.filter(p => p.engagementRate).length || 0
  }

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'create', label: 'Create Blog', icon: PenTool },
            { id: 'manage', label: 'Manage Posts', icon: FileText }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPosts}</p>
                  <p className="text-gray-600">Total Posts</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
                  <p className="text-gray-600">Scheduled</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <Eye className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
                  <p className="text-gray-600">Total Views</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.avgEngagement.toFixed(1)}%</p>
                  <p className="text-gray-600">Avg Engagement</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Posts Preview */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 font-bold">Recent Posts</h3>
                <button
                  onClick={() => setActiveTab('manage')}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  View All
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {posts.slice(0, 5).map((post) => (
                <div key={post.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{post.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{post.excerpt}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span className={`px-2 py-1 rounded-full ${
                          post.status === 'published' ? 'bg-green-100 text-green-800' :
                          post.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {post.status}
                        </span>
                        <span>{post.wordCount} words</span>
                        <span>{post.readTime} min read</span>
                        {post.views && <span>{post.views} views</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Blog Tab */}
      {activeTab === 'create' && (
        <div className="space-y-6">
          {/* AI Blog Generator */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">AI Blog Generator</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Describe what you want to write about, and AI will create a complete blog post for {brandConfig.name}
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blog Topic or Prompt
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-24"
                  placeholder="e.g., 'Write about the importance of setting daily goals for personal growth and motivation'"
                />
              </div>
              
              <button
                onClick={generateBlogWithAI}
                disabled={generating || !aiPrompt.trim()}
                className="flex items-center space-x-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
              >
                <Sparkles className="w-4 h-4" />
                <span>{generating ? 'Generating...' : 'Generate with AI'}</span>
              </button>
            </div>
          </div>

          {/* Blog Editor */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Blog Post Editor</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={blogTitle}
                  onChange={(e) => setBlogTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your blog post title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  value={blogContent}
                  onChange={(e) => setBlogContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-64"
                  placeholder="Write your blog content here..."
                />
                <div className="mt-2 text-xs text-gray-500">
                  {blogContent.length} characters • ~{Math.ceil(blogContent.length / 1000)} min read
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt
                </label>
                <textarea
                  value={blogExcerpt}
                  onChange={(e) => setBlogExcerpt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                  placeholder="Brief description for SEO and social sharing"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={blogTags}
                    onChange={(e) => setBlogTags(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="motivation, growth, mindset"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule Publication (Optional)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      value={publishDate}
                      onChange={(e) => setPublishDate(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="time"
                      value={publishTime}
                      onChange={(e) => setPublishTime(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={() => saveBlogPost('draft')}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Save as Draft
                </button>
                
                <div className="flex space-x-3">
                  {publishDate && publishTime ? (
                    <button
                      onClick={() => saveBlogPost('scheduled')}
                      className="flex items-center space-x-2 px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Schedule</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => saveBlogPost('published')}
                      className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Send className="w-4 h-4" />
                      <span>Publish Now</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage Posts Tab */}
      {activeTab === 'manage' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search posts..."
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Drafts</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
          </div>

          {/* Posts List */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Blog Posts ({filteredPosts.length})</h3>
                <button
                  onClick={() => setActiveTab('create')}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Post</span>
                </button>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {filteredPosts.map((post) => (
                <div key={post.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-gray-900">{post.title}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          post.status === 'published' ? 'bg-green-100 text-green-800' :
                          post.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {post.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{post.excerpt}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{post.wordCount} words</span>
                        <span>{post.readTime} min read</span>
                        {post.views && <span>{post.views} views</span>}
                        {post.publishedAt && (
                          <span>Published {post.publishedAt.toLocaleDateString()}</span>
                        )}
                        {post.scheduledFor && (
                          <span>Scheduled for {post.scheduledFor.toLocaleDateString()}</span>
                        )}
                        <span>Tags: {post.tags.join(', ')}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button className="p-2 text-gray-400 hover:text-blue-600">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredPosts.length === 0 && (
                <div className="p-12 text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No blog posts found</p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="mt-4 text-blue-600 hover:text-blue-700"
                  >
                    Create your first blog post
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
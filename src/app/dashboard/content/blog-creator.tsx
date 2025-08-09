'use client'

import { useState, useEffect } from 'react'
import { PenTool, Send, Eye, FileText } from 'lucide-react'

interface BlogPost {
  id?: number
  title: string
  content: string
  excerpt: string
  tags: string
  status: 'published' | 'draft'
}

interface Blog {
  id: number
  title: string
  handle: string
}

export default function BlogCreator() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [activeTab, setActiveTab] = useState<'create' | 'recent'>('create')
  
  const [blogPost, setBlogPost] = useState<BlogPost>({
    title: '',
    content: '',
    excerpt: '',
    tags: 'motivation, grit collective',
    status: 'published'
  })

  const [postType, setPostType] = useState<'custom' | 'product'>('custom')
  const [productInfo, setProductInfo] = useState({
    name: '',
    description: ''
  })

  const loadBlogs = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/shopify/blog')
      const data = await response.json()
      
      if (data.success) {
        setBlogs(data.blogs)
        setRecentPosts(data.recent_posts || [])
      } else {
        alert(`Failed to load blogs: ${data.error}`)
      }
    } catch (error) {
      console.error('Failed to load blogs:', error)
      alert('Failed to connect to Shopify blogs')
    } finally {
      setLoading(false)
    }
  }

  const publishBlogPost = async () => {
    if (!blogPost.title || !blogPost.content) {
      alert('Title and content are required')
      return
    }

    setPublishing(true)
    try {
      const requestData = {
        ...blogPost,
        post_type: postType,
        ...(postType === 'product' ? {
          product_name: productInfo.name,
          product_description: productInfo.description
        } : {})
      }

      const response = await fetch('/api/shopify/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert(`Successfully published "${data.blog_post.title}" to Shopify!`)
        setBlogPost({
          title: '',
          content: '',
          excerpt: '',
          tags: 'motivation, grit collective',
          status: 'published'
        })
        setProductInfo({ name: '', description: '' })
        loadBlogs() // Reload to show new post
      } else {
        alert(`Publishing failed: ${data.error}`)
      }
    } catch (error) {
      console.error('Publishing error:', error)
      alert('Failed to publish blog post')
    } finally {
      setPublishing(false)
    }
  }

  const generateProductPost = () => {
    if (!productInfo.name) return

    setBlogPost({
      title: `New Release: ${productInfo.name} - Transform Your Space`,
      content: `<h2>Introducing Our Latest Canvas Creation</h2>

<p>We're excited to share our newest addition to the Grit Collective family - the <strong>${productInfo.name}</strong>. This isn't just another piece of wall art; it's a daily reminder of your potential and a catalyst for transformation.</p>

<h3>Why This Piece Speaks to Your Journey</h3>

<p>${productInfo.description}</p>

<p>Every canvas we create is more than decoration - it's motivation that meets you where you are and challenges you to keep pushing forward. Whether you're starting your day, grinding through a tough workout, or winding down after conquering your goals, this piece serves as your visual anchor.</p>

<h3>Crafted for the Grind</h3>

<ul>
  <li><strong>Premium Canvas Quality:</strong> Museum-grade materials that won't fade or warp</li>
  <li><strong>Multiple Size Options:</strong> Perfect fit for any space in your home or gym</li>
  <li><strong>Ready to Hang:</strong> Gallery-wrapped and ready to inspire from day one</li>
  <li><strong>Fast Shipping:</strong> Get your motivation delivered quickly</li>
</ul>

<h3>More Than Wall Art - It's Your Daily Fuel</h3>

<p>At Grit Collective, we believe your environment shapes your mindset. Surround yourself with reminders of strength, resilience, and the relentless pursuit of growth. This canvas isn't just something you look at - it's something that looks back at you and asks, "What are you going to conquer today?"</p>

<p>Ready to add this to your space? Available now with fast, secure shipping.</p>

<p><strong>Shop now and transform your walls into your daily motivation station.</strong></p>`,
      excerpt: `Discover our latest canvas creation: ${productInfo.name}. Premium quality meets powerful motivation in this new addition to your space.`,
      tags: `new release, ${productInfo.name.toLowerCase()}, canvas art, wall decor, motivation, home gym, grit collective`,
      status: 'published'
    })
  }

  useEffect(() => {
    loadBlogs()
  }, [])

  useEffect(() => {
    if (postType === 'product' && productInfo.name && productInfo.description) {
      generateProductPost()
    }
  }, [postType, productInfo])

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Blog Creator</h2>
        <p className="text-gray-600">
          Create and publish blog posts directly to your Shopify store
        </p>
        {blogs.length > 0 && (
          <p className="text-sm text-gray-500 mt-1">
            Publishing to: <span className="font-medium">{blogs[0].title}</span>
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('create')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'create'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <PenTool className="w-4 h-4" />
              <span>Create Post</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'recent'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Recent Posts ({recentPosts.length})</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Create Tab */}
      {activeTab === 'create' && (
        <div className="space-y-6">
          {/* Post Type Selection */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Post Type</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setPostType('custom')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  postType === 'custom'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h4 className="font-medium">Custom Post</h4>
                <p className="text-sm text-gray-600">Write your own blog content</p>
              </button>
              <button
                onClick={() => setPostType('product')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  postType === 'product'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h4 className="font-medium">Product Release</h4>
                <p className="text-sm text-gray-600">Auto-generate product announcement</p>
              </button>
            </div>
          </div>

          {/* Product Info (if product post type) */}
          {postType === 'product' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Product Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={productInfo.name}
                    onChange={(e) => setProductInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mountain Sunrise Motivation Canvas"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Description *
                  </label>
                  <textarea
                    value={productInfo.description}
                    onChange={(e) => setProductInfo(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                    placeholder="This powerful canvas captures the raw beauty of a mountain sunrise, symbolizing new beginnings and the relentless pursuit of your goals..."
                  />
                </div>
                {productInfo.name && productInfo.description && (
                  <button
                    onClick={generateProductPost}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Generate Blog Post
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Blog Post Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Blog Post Content</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={blogPost.title}
                  onChange={(e) => setBlogPost(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter blog post title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content * (HTML supported)
                </label>
                <textarea
                  value={blogPost.content}
                  onChange={(e) => setBlogPost(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-64 font-mono text-sm"
                  placeholder="Write your blog content here. HTML tags are supported."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt
                </label>
                <textarea
                  value={blogPost.excerpt}
                  onChange={(e) => setBlogPost(prev => ({ ...prev, excerpt: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                  placeholder="Brief description for SEO and previews"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={blogPost.tags}
                    onChange={(e) => setBlogPost(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="motivation, grit collective"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={blogPost.status}
                    onChange={(e) => setBlogPost(prev => ({ ...prev, status: e.target.value as 'published' | 'draft' }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    {blogPost.content.length} characters
                  </span>
                  <span className="text-sm text-gray-500">
                    ~{Math.ceil(blogPost.content.length / 1000)} min read
                  </span>
                </div>
                <button
                  onClick={publishBlogPost}
                  disabled={publishing || !blogPost.title || !blogPost.content}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {publishing ? 'Publishing...' : 'Publish to Shopify'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Posts Tab */}
      {activeTab === 'recent' && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent Blog Posts</h3>
              <button
                onClick={loadBlogs}
                disabled={loading}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
          
          <div className="divide-y">
            {recentPosts.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No blog posts found</p>
              </div>
            ) : (
              recentPosts.map((post, index) => (
                <div key={index} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{post.title}</h4>
                      {post.excerpt && (
                        <p className="text-sm text-gray-600 mt-1">{post.excerpt}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>Status: {post.status}</span>
                        <span>Tags: {post.tags || 'None'}</span>
                      </div>
                    </div>
                    <button className="ml-4 p-2 text-gray-400 hover:text-gray-600">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
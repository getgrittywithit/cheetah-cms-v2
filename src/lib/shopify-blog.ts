import { shopifyAPI } from './shopify-api'

export interface ShopifyBlogPost {
  id?: number
  title: string
  content: string
  excerpt?: string
  author?: string
  tags?: string
  published_at?: string
  status?: 'published' | 'draft'
  summary?: string
  blog_id?: number
}

export interface ShopifyBlog {
  id: number
  title: string
  handle: string
}

class ShopifyBlogAPI {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const storeUrl = 'https://grit-colllective.myshopify.com'
    const apiVersion = '2025-07'
    const url = `${storeUrl}/admin/api/${apiVersion}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN || '',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Shopify Blog API Error: ${response.status} - ${errorData.errors || response.statusText}`)
    }

    const data = await response.json()
    return data
  }

  // Get all blogs
  async getBlogs(): Promise<ShopifyBlog[]> {
    try {
      const response = await this.makeRequest('/blogs.json')
      return response.blogs || []
    } catch (error) {
      console.error('Failed to get blogs:', error)
      throw error
    }
  }

  // Create a blog post
  async createBlogPost(blogId: number, postData: ShopifyBlogPost): Promise<ShopifyBlogPost> {
    try {
      const response = await this.makeRequest(`/blogs/${blogId}/articles.json`, {
        method: 'POST',
        body: JSON.stringify({ 
          article: {
            title: postData.title,
            content: postData.content,
            excerpt: postData.excerpt,
            author: postData.author || 'Grit Collective',
            tags: postData.tags,
            published_at: postData.published_at,
            status: postData.status || 'published',
            summary: postData.summary
          }
        })
      })
      return response.article
    } catch (error) {
      console.error('Failed to create blog post:', error)
      throw error
    }
  }

  // Get blog posts from a specific blog
  async getBlogPosts(blogId: number, limit: number = 50): Promise<ShopifyBlogPost[]> {
    try {
      const response = await this.makeRequest(`/blogs/${blogId}/articles.json?limit=${limit}`)
      return response.articles || []
    } catch (error) {
      console.error('Failed to get blog posts:', error)
      throw error
    }
  }

  // Update blog post
  async updateBlogPost(blogId: number, postId: number, postData: Partial<ShopifyBlogPost>): Promise<ShopifyBlogPost> {
    try {
      const response = await this.makeRequest(`/blogs/${blogId}/articles/${postId}.json`, {
        method: 'PUT',
        body: JSON.stringify({ article: postData })
      })
      return response.article
    } catch (error) {
      console.error('Failed to update blog post:', error)
      throw error
    }
  }

  // Generate blog post content for new products
  generateProductBlogPost(productName: string, productDescription: string, customContent?: string) {
    const title = `New Release: ${productName} - Transform Your Space`
    
    const content = customContent || `
      <h2>Introducing Our Latest Canvas Creation</h2>
      
      <p>We're excited to share our newest addition to the Grit Collective family - the <strong>${productName}</strong>. This isn't just another piece of wall art; it's a daily reminder of your potential and a catalyst for transformation.</p>
      
      <h3>Why This Piece Speaks to Your Journey</h3>
      
      <p>${productDescription}</p>
      
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
      
      <p><strong>Shop now and transform your walls into your daily motivation station.</strong></p>
    `
    
    const excerpt = `Discover our latest canvas creation: ${productName}. Premium quality meets powerful motivation in this new addition to your space.`
    
    return {
      title,
      content,
      excerpt,
      tags: `new release, ${productName.toLowerCase()}, canvas art, wall decor, motivation, home gym, grit collective`,
      summary: excerpt,
      status: 'published' as const,
      published_at: new Date().toISOString()
    }
  }

  // Generate general motivational blog post
  generateMotivationalPost(topic: string, content: string) {
    const title = `${topic} | Grit Collective`
    
    const blogContent = `
      <h2>${topic}</h2>
      
      ${content}
      
      <h3>Fuel Your Space, Fuel Your Mindset</h3>
      
      <p>Your environment plays a crucial role in maintaining motivation and focus. That's why we create canvas art that doesn't just decorate your walls - it transforms your entire space into a source of daily inspiration.</p>
      
      <p>Browse our collection of motivational canvas prints and find the perfect piece to elevate your home, office, or gym. Because when your walls inspire you, your potential becomes limitless.</p>
      
      <p><a href="/collections/canvas-prints"><strong>Shop Canvas Collection →</strong></a></p>
    `
    
    return {
      title,
      content: blogContent,
      excerpt: content.substring(0, 160) + '...',
      tags: 'motivation, mindset, inspiration, grit collective, personal growth',
      summary: `${topic} - motivation and inspiration from Grit Collective`,
      status: 'published' as const,
      published_at: new Date().toISOString()
    }
  }
}

export const shopifyBlogAPI = new ShopifyBlogAPI()
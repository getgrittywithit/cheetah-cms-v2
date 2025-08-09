import { NextResponse } from 'next/server'
import { shopifyBlogAPI } from '@/lib/shopify-blog'

// Get blogs and recent posts
export async function GET() {
  try {
    const blogs = await shopifyBlogAPI.getBlogs()
    
    // Get recent posts from the first blog if available
    let recentPosts = []
    if (blogs.length > 0) {
      recentPosts = await shopifyBlogAPI.getBlogPosts(blogs[0].id, 10)
    }
    
    return NextResponse.json({
      success: true,
      blogs,
      recent_posts: recentPosts,
      message: `Found ${blogs.length} blog(s)`
    })
  } catch (error) {
    console.error('Blog fetch error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch blogs'
      },
      { status: 500 }
    )
  }
}

// Create a new blog post
export async function POST(request: Request) {
  try {
    const { 
      blog_id,
      title,
      content,
      excerpt,
      tags,
      status = 'published',
      post_type = 'custom', // 'product' or 'custom'
      product_name,
      product_description
    } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Get blogs if blog_id not provided
    let targetBlogId = blog_id
    if (!targetBlogId) {
      const blogs = await shopifyBlogAPI.getBlogs()
      if (blogs.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No blogs found. Create a blog in Shopify first.' },
          { status: 400 }
        )
      }
      targetBlogId = blogs[0].id // Use first blog
    }

    let postData
    
    if (post_type === 'product' && product_name && product_description) {
      // Generate product blog post
      postData = shopifyBlogAPI.generateProductBlogPost(
        product_name, 
        product_description,
        content // Custom content if provided
      )
      // Override with any custom fields
      if (title !== product_name) postData.title = title
      if (excerpt) postData.excerpt = excerpt
      if (tags) postData.tags = tags
    } else {
      // Custom blog post
      postData = {
        title,
        content,
        excerpt: excerpt || content.substring(0, 160) + '...',
        tags: tags || 'motivation, grit collective',
        status,
        summary: excerpt,
        published_at: new Date().toISOString()
      }
    }

    const createdPost = await shopifyBlogAPI.createBlogPost(targetBlogId, postData)

    return NextResponse.json({
      success: true,
      blog_post: createdPost,
      blog_id: targetBlogId,
      message: `Successfully published "${createdPost.title}" to Shopify blog`
    })

  } catch (error) {
    console.error('Blog publish error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to publish blog post'
      },
      { status: 500 }
    )
  }
}
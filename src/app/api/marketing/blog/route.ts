import { NextRequest, NextResponse } from 'next/server'
import { BlogPost } from '@/lib/marketing-types'

// In-memory storage for now (replace with database later)
const blogPosts: BlogPost[] = []

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    let filteredPosts = blogPosts
    
    if (status) {
      filteredPosts = filteredPosts.filter(post => post.status === status)
    }
    
    // Sort by published date or created date
    filteredPosts.sort((a, b) => {
      const dateA = a.publishedAt || a.createdAt
      const dateB = b.publishedAt || b.createdAt
      return new Date(dateB).getTime() - new Date(dateA).getTime()
    })
    
    return NextResponse.json({
      success: true,
      posts: filteredPosts,
      total: filteredPosts.length
    })
  } catch (error) {
    console.error('Failed to get blog posts:', error)
    return NextResponse.json(
      { error: 'Failed to get blog posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    
    const newPost: BlogPost = {
      id: Date.now().toString(),
      brandId: data.brandId || 'default',
      title: data.title,
      slug: slug,
      content: data.content,
      excerpt: data.excerpt || data.content.substring(0, 160) + '...',
      featuredImage: data.featuredImage,
      author: data.author || 'Admin',
      tags: data.tags || [],
      status: data.status || 'draft',
      publishedAt: data.status === 'published' ? new Date() : undefined,
      seoTitle: data.seoTitle || data.title,
      seoDescription: data.seoDescription || data.excerpt,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    blogPosts.push(newPost)
    
    return NextResponse.json({
      success: true,
      post: newPost
    })
  } catch (error) {
    console.error('Failed to create blog post:', error)
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    )
  }
}
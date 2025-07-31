import { NextRequest, NextResponse } from 'next/server'
import { SocialPost } from '@/lib/marketing-types'

// In-memory storage for now (replace with database later)
let socialPosts: SocialPost[] = []

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')
    const status = searchParams.get('status')
    
    let filteredPosts = socialPosts
    
    if (platform) {
      filteredPosts = filteredPosts.filter(post => post.platform === platform)
    }
    
    if (status) {
      filteredPosts = filteredPosts.filter(post => post.status === status)
    }
    
    // Sort by scheduled date or created date
    filteredPosts.sort((a, b) => {
      const dateA = a.scheduledFor || a.createdAt
      const dateB = b.scheduledFor || b.createdAt
      return new Date(dateB).getTime() - new Date(dateA).getTime()
    })
    
    return NextResponse.json({
      success: true,
      posts: filteredPosts,
      total: filteredPosts.length
    })
  } catch (error) {
    console.error('Failed to get social posts:', error)
    return NextResponse.json(
      { error: 'Failed to get social posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const newPost: SocialPost = {
      id: Date.now().toString(),
      brandId: data.brandId || 'default',
      platform: data.platform,
      content: data.content,
      media: data.media || [],
      hashtags: data.hashtags || [],
      scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : undefined,
      status: data.scheduledFor ? 'scheduled' : 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    socialPosts.push(newPost)
    
    return NextResponse.json({
      success: true,
      post: newPost
    })
  } catch (error) {
    console.error('Failed to create social post:', error)
    return NextResponse.json(
      { error: 'Failed to create social post' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, ...updates } = data
    
    const postIndex = socialPosts.findIndex(post => post.id === id)
    if (postIndex === -1) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }
    
    socialPosts[postIndex] = {
      ...socialPosts[postIndex],
      ...updates,
      updatedAt: new Date()
    }
    
    return NextResponse.json({
      success: true,
      post: socialPosts[postIndex]
    })
  } catch (error) {
    console.error('Failed to update social post:', error)
    return NextResponse.json(
      { error: 'Failed to update social post' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    
    socialPosts = socialPosts.filter(post => post.id !== id)
    
    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete social post:', error)
    return NextResponse.json(
      { error: 'Failed to delete social post' },
      { status: 500 }
    )
  }
}
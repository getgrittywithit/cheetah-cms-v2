import { NextRequest, NextResponse } from 'next/server'
import { SocialPost } from '@/lib/marketing-types'
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')
    const status = searchParams.get('status')
    const brandId = searchParams.get('brandId')
    
    // For now, use a hardcoded user ID (replace with proper auth later)
    const userId = 'temp-user-id'
    
    // Build query
    let query = supabase
      .from('content_calendar')
      .select('*')
      .order('scheduled_date', { ascending: false })
    
    // Apply filters
    if (platform) {
      query = query.contains('platforms', [platform])
    }
    
    if (status) {
      query = query.eq('status', status)
    }
    
    if (brandId) {
      query = query.eq('brand_profile_id', brandId)
    }
    
    const { data, error } = await query
    
    if (error) {
      throw error
    }
    
    // Transform data to match SocialPost interface
    const posts: SocialPost[] = (data || []).map(item => ({
      id: item.id,
      brandId: item.brand_profile_id,
      platform: item.platforms[0] || 'facebook', // Use first platform
      content: item.content_text || '',
      media: item.media_urls || [],
      hashtags: item.hashtags || [],
      scheduledFor: item.scheduled_date ? new Date(item.scheduled_date) : undefined,
      status: item.status as 'draft' | 'scheduled' | 'published' | 'failed',
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at)
    }))
    
    return NextResponse.json({
      success: true,
      posts,
      total: posts.length
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
    
    // For now, use a hardcoded user ID (replace with proper auth later)
    const userId = 'temp-user-id'
    
    const { data: insertedData, error } = await supabase
      .from('content_calendar')
      .insert({
        user_id: userId,
        brand_profile_id: data.brandId || 'default',
        title: data.content.substring(0, 100), // First 100 chars as title
        content_type: 'post',
        platforms: [data.platform],
        scheduled_date: data.scheduledFor || new Date().toISOString(),
        status: data.scheduledFor ? 'scheduled' : 'draft',
        content_text: data.content,
        hashtags: data.hashtags || [],
        media_urls: data.media || []
      })
      .select()
      .single()
    
    if (error) {
      throw error
    }
    
    // Transform to SocialPost format
    const newPost: SocialPost = {
      id: insertedData.id,
      brandId: insertedData.brand_profile_id,
      platform: insertedData.platforms[0],
      content: insertedData.content_text,
      media: insertedData.media_urls,
      hashtags: insertedData.hashtags,
      scheduledFor: insertedData.scheduled_date ? new Date(insertedData.scheduled_date) : undefined,
      status: insertedData.status as 'draft' | 'scheduled' | 'published' | 'failed',
      createdAt: new Date(insertedData.created_at),
      updatedAt: new Date(insertedData.updated_at)
    }
    
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
    
    const updateData: any = {}
    
    if (updates.content !== undefined) {
      updateData.content_text = updates.content
      updateData.title = updates.content.substring(0, 100)
    }
    if (updates.hashtags !== undefined) updateData.hashtags = updates.hashtags
    if (updates.media !== undefined) updateData.media_urls = updates.media
    if (updates.scheduledFor !== undefined) updateData.scheduled_date = updates.scheduledFor
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.platform !== undefined) updateData.platforms = [updates.platform]
    
    updateData.updated_at = new Date().toISOString()
    
    const { data: updatedData, error } = await supabase
      .from('content_calendar')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Post not found' },
          { status: 404 }
        )
      }
      throw error
    }
    
    // Transform to SocialPost format
    const updatedPost: SocialPost = {
      id: updatedData.id,
      brandId: updatedData.brand_profile_id,
      platform: updatedData.platforms[0],
      content: updatedData.content_text,
      media: updatedData.media_urls,
      hashtags: updatedData.hashtags,
      scheduledFor: updatedData.scheduled_date ? new Date(updatedData.scheduled_date) : undefined,
      status: updatedData.status as 'draft' | 'scheduled' | 'published' | 'failed',
      createdAt: new Date(updatedData.created_at),
      updatedAt: new Date(updatedData.updated_at)
    }
    
    return NextResponse.json({
      success: true,
      post: updatedPost
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
    
    const { error } = await supabase
      .from('content_calendar')
      .delete()
      .eq('id', id)
    
    if (error) {
      throw error
    }
    
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
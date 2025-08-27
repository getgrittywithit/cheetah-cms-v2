import { NextRequest, NextResponse } from 'next/server'
import { SocialPost } from '@/lib/marketing-types'
import { supabaseAdmin } from '@/lib/supabase'
import { cookies } from 'next/headers'
// Removed getBrandConfig import - now using database lookups only

// Helper function to resolve brand ID from slug or UUID
async function resolveBrandId(brandIdOrSlug: string): Promise<string | null> {
  // If it looks like a UUID, use it as-is
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (uuidRegex.test(brandIdOrSlug)) {
    console.log('🔵 Using provided UUID:', brandIdOrSlug)
    return brandIdOrSlug
  }
  
  // Look up brand by slug in database
  console.log('🔵 Looking up brand by slug:', brandIdOrSlug)
  try {
    const { data: brand, error } = await supabaseAdmin
      .from('brand_profiles')
      .select('id')
      .eq('slug', brandIdOrSlug)
      .single()
    
    if (error) {
      console.error('🔴 Brand lookup error:', error)
      return null
    }
    
    if (brand?.id) {
      console.log('🔵 Found brand ID for slug:', { slug: brandIdOrSlug, id: brand.id })
      return brand.id
    }
    
    console.log('🔴 No brand found for slug:', brandIdOrSlug)
    return null
    
  } catch (error) {
    console.error('🔴 Database error during brand lookup:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')
    const status = searchParams.get('status')
    const brandIdParam = searchParams.get('brandId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    console.log('🔵 Marketing Posts API - Request params:', {
      platform,
      status,
      brandId: brandIdParam,
      startDate,
      endDate
    })
    
    // Resolve brand ID if provided
    let brandId: string | null = null
    if (brandIdParam) {
      brandId = await resolveBrandId(brandIdParam)
      console.log('🔵 Resolved brandId:', { input: brandIdParam, resolved: brandId })
    }
    
    // For now, use a hardcoded user ID (replace with proper auth later)
    const userId = '00000000-0000-0000-0000-000000000000'
    
    // Build query
    let query = supabaseAdmin
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
      console.log('🔵 Using brandId for query:', brandId)
      query = query.eq('brand_profile_id', brandId)
    }
    
    // Apply date filters if provided
    if (startDate) {
      query = query.gte('scheduled_date', startDate)
    }
    
    if (endDate) {
      query = query.lte('scheduled_date', endDate)
    }
    
    console.log('🔵 Executing query on content_calendar table')
    const { data, error } = await query
    
    if (error) {
      console.error('🔴 Supabase query error:', error)
      throw error
    }
    
    console.log('🔵 Query successful, found', data?.length || 0, 'posts')
    
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
    console.error('🔴 Failed to get social posts:', error)
    
    // Provide more specific error messages
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      { 
        error: 'Failed to load scheduled posts',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    console.log('🔵 Creating social post with data:', {
      brandId: data.brandId,
      platform: data.platform,
      hasContent: !!data.content,
      scheduledFor: data.scheduledFor
    })
    
    // Resolve brand ID
    let resolvedBrandId = 'default'
    if (data.brandId) {
      const resolved = await resolveBrandId(data.brandId)
      if (resolved) {
        resolvedBrandId = resolved
      }
    }
    
    console.log('🔵 Using resolved brandId:', resolvedBrandId)
    
    // For now, use a hardcoded user ID (replace with proper auth later)
    const userId = '00000000-0000-0000-0000-000000000000'
    
    const insertPayload = {
      user_id: userId,
      brand_profile_id: resolvedBrandId,
      title: data.content ? data.content.substring(0, 100) : 'Untitled Post',
      content_type: 'post',
      platforms: [data.platform],
      scheduled_date: data.scheduledFor || new Date().toISOString(),
      status: data.scheduledFor ? 'scheduled' : 'draft',
      content_text: data.content || '',
      hashtags: data.hashtags || [],
      media_urls: data.media || []
    }
    
    console.log('🔵 Inserting to content_calendar:', insertPayload)
    
    const { data: insertedData, error } = await supabaseAdmin
      .from('content_calendar')
      .insert(insertPayload)
      .select()
      .single()
    
    if (error) {
      console.error('🔴 Supabase insert error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      throw error
    }
    
    console.log('🔵 Successfully inserted post:', insertedData?.id)
    
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
    
    const { data: updatedData, error } = await supabaseAdmin
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
    
    const { error } = await supabaseAdmin
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
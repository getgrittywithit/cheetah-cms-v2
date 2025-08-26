import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const now = new Date()
    const currentTime = now.toISOString()
    
    console.log(`Testing scheduled posts query at ${currentTime}`)

    // Test query to see what scheduled posts exist
    const { data: scheduledPosts, error: postsError } = await supabaseAdmin
      .from('content_calendar')
      .select(`
        *,
        brand_profiles!inner (
          id,
          name
        )
      `)
      .eq('status', 'scheduled')
      .order('scheduled_date', { ascending: true })

    if (postsError) {
      throw postsError
    }

    // Also check posts due for publishing
    const { data: duePosts, error: dueError } = await supabaseAdmin
      .from('content_calendar')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_date', currentTime)

    if (dueError) {
      throw dueError
    }

    return NextResponse.json({
      success: true,
      timestamp: currentTime,
      totalScheduled: scheduledPosts?.length || 0,
      dueForPublishing: duePosts?.length || 0,
      scheduledPosts: scheduledPosts?.map(post => ({
        id: post.id,
        brand: post.brand_profiles?.name,
        content: post.content_text?.substring(0, 50) + '...',
        platform: post.platforms?.[0],
        scheduledFor: post.scheduled_date,
        status: post.status
      })) || [],
      duePosts: duePosts?.map(post => ({
        id: post.id,
        scheduledFor: post.scheduled_date,
        timeDiff: new Date(post.scheduled_date).getTime() - now.getTime()
      })) || []
    })

  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json(
      { error: 'Failed to test scheduled posts', details: String(error) },
      { status: 500 }
    )
  }
}
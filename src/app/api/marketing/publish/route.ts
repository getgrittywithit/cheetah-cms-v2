import { NextRequest, NextResponse } from 'next/server'
import { SocialMediaAPI } from '@/lib/social-api'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { post, brand, mediaUrls } = await request.json()

    if (!post || !brand) {
      return NextResponse.json(
        { error: 'Post and brand data required' },
        { status: 400 }
      )
    }

    // Validate brand has the required social account
    const account = brand.socialAccounts?.find((acc: { platform: string }) => acc.platform === post.platform)
    if (!account) {
      return NextResponse.json(
        { error: `No ${post.platform} account configured for ${brand.name}` },
        { status: 400 }
      )
    }

    // Check if this is a scheduled post for the future
    const now = new Date()
    const scheduledFor = post.scheduledFor ? new Date(post.scheduledFor) : null
    
    if (scheduledFor && scheduledFor > now) {
      // For scheduled posts, we'll store them and handle via a cron job later
      // For now, just return success with scheduled status
      return NextResponse.json({
        success: true,
        message: 'Post scheduled successfully',
        postId: post.id,
        scheduledFor: scheduledFor,
        status: 'scheduled'
      })
    } else {
      // Publish immediately
      const result = await SocialMediaAPI.publishPost(post, brand, mediaUrls)
      
      if (result.success) {
        console.log('🔵 Post published successfully, updating database status...')
        
        // Update post status in database
        try {
          const { error: updateError } = await supabaseAdmin
            .from('social_posts')
            .update({ 
              status: 'published',
              published_at: new Date().toISOString(),
              platform_post_id: result.platformPostId || null
            })
            .eq('id', post.id)

          if (updateError) {
            console.error('🔴 Failed to update post status in database:', updateError)
          } else {
            console.log('🔵 Post status updated to published in database')
          }
        } catch (dbError) {
          console.error('🔴 Database update error:', dbError)
        }
        
        return NextResponse.json({
          success: true,
          message: 'Post published successfully',
          postId: result.postId,
          platformPostId: result.platformPostId,
          status: 'published'
        })
      } else {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        )
      }
    }

  } catch (error) {
    console.error('Publishing error:', error)
    return NextResponse.json(
      { error: 'Failed to publish post' },
      { status: 500 }
    )
  }
}
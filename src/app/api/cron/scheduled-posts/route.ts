import { NextRequest, NextResponse } from 'next/server'
import { SocialMediaAPI } from '@/lib/social-api'
import { SocialPost } from '@/lib/marketing-types'
import { supabase } from '@/lib/supabase'

// This will be called by Vercel Cron Jobs to process scheduled posts
export async function POST(request: NextRequest) {
  try {
    // Verify this is coming from Vercel Cron (optional security)
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const currentTime = now.toISOString()
    
    console.log(`Running scheduled posts cron at ${currentTime}`)

    // Fetch all scheduled posts that are due
    const { data: duePosts, error: postsError } = await supabase
      .from('content_calendar')
      .select(`
        *,
        brand_profiles!inner (
          id,
          name,
          social_accounts!inner (
            platform,
            access_token,
            account_id,
            account_handle,
            posting_enabled
          )
        )
      `)
      .eq('status', 'scheduled')
      .lte('scheduled_date', currentTime)
      .order('scheduled_date', { ascending: true })

    if (postsError) {
      throw postsError
    }

    let processedPosts = 0
    const errors: string[] = []

    // Process each scheduled post
    for (const post of duePosts || []) {
      try {
        const brand = post.brand_profiles
        const platform = post.platforms[0] // Use first platform
        
        // Find the social account for this platform
        const socialAccount = brand.social_accounts.find(
          (acc: Record<string, unknown>) => acc.platform === platform && acc.posting_enabled
        )

        if (!socialAccount) {
          errors.push(`No active ${platform} account for brand ${brand.name}`)
          continue
        }

        // Create SocialPost object
        const socialPost: SocialPost = {
          id: post.id,
          brandId: post.brand_profile_id,
          platform,
          content: post.content_text || '',
          media: post.media_urls || [],
          hashtags: post.hashtags || [],
          scheduledFor: new Date(post.scheduled_date),
          status: 'scheduled',
          createdAt: new Date(post.created_at),
          updatedAt: new Date(post.updated_at)
        }

        // Create brand object with social accounts
        const brandObj = {
          id: brand.id,
          name: brand.name,
          socialAccounts: [{
            platform: socialAccount.platform,
            accessToken: socialAccount.access_token,
            pageId: socialAccount.account_id,
            handle: socialAccount.account_handle
          }]
        }

        console.log(`Publishing scheduled post ${post.id} for ${brand.name}`)
        
        const result = await SocialMediaAPI.publishPost(socialPost, brandObj, post.media_urls)
        
        if (result.success) {
          // Update post status to published
          const { error: updateError } = await supabase
            .from('content_calendar')
            .update({ 
              status: 'published',
              actual_performance: { platform_post_id: result.platformPostId },
              updated_at: new Date().toISOString()
            })
            .eq('id', post.id)

          if (updateError) {
            errors.push(`Failed to update post ${post.id} status: ${updateError.message}`)
          } else {
            console.log(`Successfully published post ${post.id}`)
            processedPosts++
          }
        } else {
          // Update post status to failed
          await supabase
            .from('content_calendar')
            .update({ 
              status: 'failed',
              actual_performance: { error: result.error },
              updated_at: new Date().toISOString()
            })
            .eq('id', post.id)
            
          errors.push(`Failed to publish post ${post.id}: ${result.error}`)
        }
      } catch (error) {
        errors.push(`Error publishing post ${post.id}: ${error}`)
      }
    }

    return NextResponse.json({
      success: true,
      processed: processedPosts,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: currentTime
    })

  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Failed to process scheduled posts' },
      { status: 500 }
    )
  }
}

// Also allow GET for manual testing
export async function GET(request: NextRequest) {
  return POST(request)
}
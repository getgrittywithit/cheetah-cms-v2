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

    // Validate brand has the required social token
    const platformToken = brand.socialTokens?.[post.platform]
    if (!platformToken) {
      console.log(`🔴 No ${post.platform} token found for brand:`, brand.name)
      console.log('Available social tokens:', Object.keys(brand.socialTokens || {}))
      return NextResponse.json(
        { error: `No ${post.platform} token configured for ${brand.name}. Please add the token to environment variables.` },
        { status: 400 }
      )
    }
    
    console.log(`🔵 Found ${post.platform} token for ${brand.name}, proceeding...`)

    // Check if this is a scheduled post for the future
    const now = new Date()
    const scheduledFor = post.scheduledFor ? new Date(post.scheduledFor) : null
    
    if (scheduledFor && scheduledFor > now) {
      // Store scheduled post in the content_calendar table
      try {
        const { data: insertedPost, error: insertError } = await supabaseAdmin
          .from('content_calendar')
          .insert({
            user_id: brand.userId || '00000000-0000-0000-0000-000000000000', // Default user ID
            brand_profile_id: brand.slug || brand.id || 'default', // Use brand slug as ID
            title: `${post.platform} Post`,
            content_type: 'social_post',
            platforms: [post.platform],
            scheduled_date: scheduledFor.toISOString(),
            status: 'scheduled',
            content_text: post.content,
            hashtags: post.hashtags ? post.hashtags.split(' ').filter(Boolean) : [],
            media_urls: mediaUrls || []
          })
          .select()
          .single()

        if (insertError) {
          console.error('🔴 Failed to save scheduled post:', insertError)
          throw insertError
        }

        console.log('🔵 Scheduled post saved to database:', insertedPost.id)
        
        return NextResponse.json({
          success: true,
          message: 'Post scheduled successfully',
          postId: insertedPost.id,
          scheduledFor: scheduledFor,
          status: 'scheduled'
        })
      } catch (error) {
        console.error('🔴 Error saving scheduled post:', error)
        return NextResponse.json(
          { error: 'Failed to schedule post' },
          { status: 500 }
        )
      }
    } else {
      // Publish immediately
      // Convert brand config to expected Brand format
      const adaptedBrand = {
        name: brand.name,
        socialAccounts: [{
          platform: post.platform,
          accessToken: brand.socialTokens?.[post.platform],
          pageId: post.platform === 'facebook' ? brand.socialTokens?.facebookPageId : undefined,
          accountId: post.platform === 'instagram' ? brand.socialTokens?.instagramAccountId : undefined,
          isActive: true
        }]
      }
      
      console.log(`🔵 Publishing to ${post.platform} for brand:`, brand.name)
      console.log(`🔵 Access token available:`, !!adaptedBrand.socialAccounts[0].accessToken)
      console.log(`🔵 Page ID available:`, !!adaptedBrand.socialAccounts[0].pageId)
      console.log(`🔵 Account ID available:`, !!adaptedBrand.socialAccounts[0].accountId)
      console.log(`🔵 Post content length:`, post.content?.length)
      console.log(`🔵 Media URLs:`, mediaUrls?.length || 0)
      
      const result = await SocialMediaAPI.publishPost(post, adaptedBrand, mediaUrls)
      
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
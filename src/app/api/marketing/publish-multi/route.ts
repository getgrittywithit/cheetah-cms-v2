import { NextRequest, NextResponse } from 'next/server'
import { getBrandConfig } from '@/lib/brand-config'
import { SocialMediaAPI } from '@/lib/social-api'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { platforms, content, hashtags, scheduledFor, imageUrl, isImmediate, brandSlug } = await request.json()

    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json(
        { error: 'Platforms array is required' },
        { status: 400 }
      )
    }

    if (!content || !brandSlug) {
      return NextResponse.json(
        { error: 'Content and brandSlug are required' },
        { status: 400 }
      )
    }

    console.log(`🔵 Multi-platform publishing to: ${platforms.join(', ')}`)

    const brandConfig = getBrandConfig(brandSlug)
    if (!brandConfig) {
      return NextResponse.json(
        { error: `Brand configuration not found for: ${brandSlug}` },
        { status: 400 }
      )
    }

    const results: { platform: string; success: boolean; error?: string; postId?: string }[] = []
    
    // Process each platform sequentially to avoid rate limits
    for (const platform of platforms) {
      try {
        console.log(`🔵 Publishing to ${platform}...`)
        
        // Check if brand has token for this platform
        const platformToken = brandConfig.socialTokens?.[platform as keyof typeof brandConfig.socialTokens]
        if (!platformToken) {
          console.log(`🔴 No ${platform} token found for brand:`, brandConfig.name)
          results.push({
            platform,
            success: false,
            error: `No ${platform} token configured for ${brandConfig.name}`
          })
          continue
        }

        const now = new Date()
        const scheduledForDate = scheduledFor ? new Date(scheduledFor) : null
        
        if (scheduledForDate && scheduledForDate > now && !isImmediate) {
          // Schedule for later
          const { data: insertedPost, error: insertError } = await supabaseAdmin
            .from('content_calendar')
            .insert({
              user_id: '00000000-0000-0000-0000-000000000000',
              brand_profile_id: brandSlug,
              title: `${platform} Post`,
              content_type: 'social_post',
              platforms: [platform],
              scheduled_date: scheduledForDate.toISOString(),
              status: 'scheduled',
              content_text: content,
              hashtags: hashtags ? hashtags.split(' ').filter(Boolean) : [],
              media_urls: imageUrl ? [imageUrl] : []
            })
            .select()
            .single()

          if (insertError) {
            console.error(`🔴 Failed to save scheduled post for ${platform}:`, insertError)
            results.push({
              platform,
              success: false,
              error: `Failed to schedule for ${platform}: ${insertError.message}`
            })
          } else {
            console.log(`🔵 Scheduled ${platform} post for:`, scheduledForDate)
            results.push({
              platform,
              success: true,
              postId: insertedPost.id
            })
          }
        } else {
          // Publish immediately
          const adaptedBrand = {
            name: brandConfig.name,
            socialAccounts: [{
              platform: platform,
              accessToken: platformToken,
              pageId: platform === 'facebook' ? brandConfig.socialTokens?.facebookPageId : undefined,
              isActive: true
            }]
          }

          const publishResult = await SocialMediaAPI.publishPost({
            platform,
            content,
            hashtags,
            imageUrl
          }, adaptedBrand, imageUrl ? [imageUrl] : [])

          if (publishResult.success) {
            console.log(`🟢 Successfully published to ${platform}`)
            results.push({
              platform,
              success: true,
              postId: publishResult.postId
            })
          } else {
            console.error(`🔴 Failed to publish to ${platform}:`, publishResult.error)
            results.push({
              platform,
              success: false,
              error: publishResult.error
            })
          }
        }

        // Small delay between platforms to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (platformError) {
        console.error(`🔴 Error processing ${platform}:`, platformError)
        results.push({
          platform,
          success: false,
          error: platformError instanceof Error ? platformError.message : 'Unknown error'
        })
      }
    }

    // Summary of results
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    console.log(`🔵 Multi-platform publishing completed: ${successful} successful, ${failed} failed`)

    return NextResponse.json({
      success: successful > 0,
      results,
      summary: {
        total: platforms.length,
        successful,
        failed
      }
    })

  } catch (error) {
    console.error('🔴 Multi-platform publishing error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to publish to multiple platforms',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
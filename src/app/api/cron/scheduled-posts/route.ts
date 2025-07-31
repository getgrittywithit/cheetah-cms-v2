import { NextRequest, NextResponse } from 'next/server'
import { SocialMediaAPI } from '@/lib/social-api'
import { SocialPost } from '@/lib/marketing-types'

// This will be called by Vercel Cron Jobs to process scheduled posts
export async function POST(request: NextRequest) {
  try {
    // Verify this is coming from Vercel Cron (optional security)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const currentTime = now.toISOString()
    
    console.log(`Running scheduled posts cron at ${currentTime}`)

    // In a real implementation, you'd fetch from your database
    // For now, we'll use the in-memory storage and add a database later
    
    // Get all brands with their social accounts
    const brandsResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/brands`)
    const brandsData = await brandsResponse.json()
    
    if (!brandsData.success) {
      return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 })
    }

    const brands = brandsData.brands
    let processedPosts = 0
    const errors: string[] = []

    // Process each brand's scheduled posts
    for (const brand of brands) {
      try {
        // Fetch scheduled posts for this brand
        const postsResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/marketing/posts?brandId=${brand.id}&status=scheduled`)
        const postsData = await postsResponse.json()
        
        if (postsData.success && postsData.posts) {
          const scheduledPosts = postsData.posts.filter((post: SocialPost) => {
            if (!post.scheduledFor) return false
            
            const scheduledTime = new Date(post.scheduledFor)
            const timeDiff = Math.abs(scheduledTime.getTime() - now.getTime())
            
            // Process posts scheduled within the last 5 minutes
            return timeDiff <= 5 * 60 * 1000 && scheduledTime <= now
          })

          // Publish each scheduled post
          for (const post of scheduledPosts) {
            try {
              console.log(`Publishing scheduled post ${post.id} for ${brand.name}`)
              
              const result = await SocialMediaAPI.publishPost(post, brand, post.media)
              
              if (result.success) {
                // Update post status to published
                // In a real app, you'd update the database here
                console.log(`Successfully published post ${post.id}`)
                processedPosts++
              } else {
                errors.push(`Failed to publish post ${post.id}: ${result.error}`)
              }
            } catch (error) {
              errors.push(`Error publishing post ${post.id}: ${error}`)
            }
          }
        }
      } catch (error) {
        errors.push(`Error processing brand ${brand.name}: ${error}`)
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
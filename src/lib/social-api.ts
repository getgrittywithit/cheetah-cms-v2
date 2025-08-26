import { SocialPost } from '@/lib/marketing-types'
import { Brand, SocialAccount } from '@/lib/brand-types'

export interface PostResponse {
  success: boolean
  postId?: string
  platformPostId?: string
  error?: string
  scheduledFor?: Date
}

export class SocialMediaAPI {
  // Facebook API Integration
  static async postToFacebook(
    post: SocialPost, 
    account: SocialAccount,
    mediaUrls?: string[]
  ): Promise<PostResponse> {
    try {
      console.log('🔵 Facebook posting attempt:', {
        postId: post.id,
        platform: post.platform,
        hasAccessToken: !!account.accessToken,
        tokenLength: account.accessToken?.length,
        hasPageId: !!account.pageId,
        pageId: account.pageId,
        contentLength: post.content?.length,
        hashtagsCount: post.hashtags?.length,
        mediaUrlsCount: mediaUrls?.length
      })

      if (!account.accessToken || !account.pageId) {
        throw new Error('Facebook access token or page ID not configured')
      }

      // Use /photos endpoint for posts with images, /feed for text-only
      const hasImages = mediaUrls && mediaUrls.length > 0
      const url = hasImages 
        ? `https://graph.facebook.com/v19.0/${account.pageId}/photos`
        : `https://graph.facebook.com/v19.0/${account.pageId}/feed`
      
      console.log('🔵 Facebook API URL:', url)
      console.log('🔵 Has images:', hasImages)
      
      const postData: Record<string, unknown> = {
        message: post.content + '\n\n' + post.hashtags.join(' '),
        access_token: account.accessToken
      }

      // For posts with images, use the photos endpoint
      if (hasImages) {
        // Use the image URL directly - Facebook will fetch it
        postData.url = mediaUrls[0]
        console.log('🔵 Adding image URL for photos endpoint:', mediaUrls[0])
      } else {
        console.log('🔵 Text-only post to feed endpoint')
      }

      // Handle scheduled posts
      if (post.scheduledFor && new Date(post.scheduledFor) > new Date()) {
        postData.published = false
        postData.scheduled_publish_time = Math.floor(new Date(post.scheduledFor).getTime() / 1000)
        console.log('🔵 Scheduling post for:', new Date(post.scheduledFor))
      }

      console.log('🔵 Facebook API request data:', {
        url,
        messageLength: postData.message?.toString().length,
        hasLink: !!postData.link,
        isScheduled: !!postData.scheduled_publish_time
      })

      // Facebook Graph API expects form data, not JSON
      const formData = new URLSearchParams()
      Object.entries(postData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value))
        }
      })

      console.log('🔵 Form data being sent:', formData.toString())

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      })

      const data = await response.json()
      console.log('🔵 Facebook API response:', {
        status: response.status,
        ok: response.ok,
        data: data
      })

      if (!response.ok) {
        console.error('🔴 Facebook API error:', data)
        throw new Error(data.error?.message || `Facebook API error: ${response.status}`)
      }

      return {
        success: true,
        postId: post.id,
        platformPostId: data.id,
        scheduledFor: post.scheduledFor
      }

    } catch (error) {
      console.error('Facebook posting error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Instagram API Integration (Instagram Graph API for Business)
  static async postToInstagram(
    post: SocialPost,
    account: SocialAccount,
    mediaUrls?: string[]
  ): Promise<PostResponse> {
    try {
      if (!account.accessToken || !account.accountId) {
        throw new Error('Instagram access token or account ID not configured')
      }

      // Instagram requires media for all posts
      if (!mediaUrls || mediaUrls.length === 0) {
        throw new Error('Instagram posts require at least one image')
      }

      // Step 1: Create media container
      const containerUrl = `https://graph.facebook.com/v18.0/${account.accountId}/media`
      
      const containerData: Record<string, unknown> = {
        caption: post.content + '\n\n' + post.hashtags.join(' '),
        access_token: account.accessToken
      }

      // Handle single image post
      if (mediaUrls.length === 1) {
        containerData.image_url = mediaUrls[0]
      } else {
        // For carousel posts, we need to create individual media containers first
        // This is a simplified version - full implementation would handle carousel
        containerData.image_url = mediaUrls[0]
      }

      const containerResponse = await fetch(containerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(containerData)
      })

      const containerResult = await containerResponse.json()

      if (!containerResponse.ok) {
        throw new Error(containerResult.error?.message || 'Failed to create media container')
      }

      // Step 2: Check container status (optional but recommended)
      // In production, you'd want to poll this until status is 'FINISHED'
      
      // Step 3: Publish the media container
      const publishUrl = `https://graph.facebook.com/v18.0/${account.accountId}/media_publish`
      
      const publishData = {
        creation_id: containerResult.id,
        access_token: account.accessToken
      }

      // Handle scheduled posts
      if (post.scheduledFor && new Date(post.scheduledFor) > new Date()) {
        // Instagram doesn't support direct scheduling via API
        // You'd need to implement your own scheduling system
        return {
          success: true,
          postId: post.id,
          platformPostId: containerResult.id,
          scheduledFor: post.scheduledFor,
          error: 'Instagram API does not support scheduling. Post will be published by cron job.'
        }
      }

      const publishResponse = await fetch(publishUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(publishData)
      })

      const publishResult = await publishResponse.json()

      if (!publishResponse.ok) {
        throw new Error(publishResult.error?.message || 'Failed to publish post')
      }

      return {
        success: true,
        postId: post.id,
        platformPostId: publishResult.id
      }

    } catch (error) {
      console.error('Instagram posting error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // TikTok API Integration
  static async postToTikTok(
    _post: SocialPost,
    _account: SocialAccount,
    _mediaUrls?: string[]
  ): Promise<PostResponse> {
    return {
      success: false,
      error: 'TikTok API integration coming soon'
    }
  }

  // Pinterest API Integration
  static async postToPinterest(
    _post: SocialPost,
    _account: SocialAccount,
    _mediaUrls?: string[]
  ): Promise<PostResponse> {
    return {
      success: false,
      error: 'Pinterest API integration coming soon'
    }
  }

  // Twitter API Integration
  static async postToTwitter(
    _post: SocialPost,
    _account: SocialAccount,
    _mediaUrls?: string[]
  ): Promise<PostResponse> {
    return {
      success: false,
      error: 'Twitter API integration coming soon'
    }
  }

  // Main posting function
  static async publishPost(
    post: SocialPost,
    brand: Brand,
    mediaUrls?: string[]
  ): Promise<PostResponse> {
    const account = brand.socialAccounts.find(acc => acc.platform === post.platform)
    
    if (!account) {
      return {
        success: false,
        error: `No ${post.platform} account configured for ${brand.name}`
      }
    }

    if (!account.isActive) {
      return {
        success: false,
        error: `${post.platform} account is disabled for ${brand.name}`
      }
    }

    switch (post.platform) {
      case 'facebook':
        return this.postToFacebook(post, account, mediaUrls)
      case 'instagram':
        return this.postToInstagram(post, account, mediaUrls)
      case 'tiktok':
        return this.postToTikTok(post, account, mediaUrls)
      case 'pinterest':
        return this.postToPinterest(post, account, mediaUrls)
      case 'twitter':
        return this.postToTwitter(post, account, mediaUrls)
      default:
        return {
          success: false,
          error: `Platform ${post.platform} not supported`
        }
    }
  }

  // Get post analytics
  static async getPostAnalytics(
    platformPostId: string,
    platform: string,
    account: SocialAccount
  ): Promise<Record<string, unknown>> {
    try {
      switch (platform) {
        case 'facebook':
          if (!account.accessToken) throw new Error('No access token')
          
          const response = await fetch(
            `https://graph.facebook.com/v18.0/${platformPostId}?fields=likes.summary(true),comments.summary(true),shares&access_token=${account.accessToken}`
          )
          
          const data = await response.json()
          
          return {
            likes: data.likes?.summary?.total_count || 0,
            comments: data.comments?.summary?.total_count || 0,
            shares: data.shares?.count || 0
          }
          
        default:
          return {}
      }
    } catch (error) {
      console.error('Analytics fetch error:', error)
      return {}
    }
  }
}
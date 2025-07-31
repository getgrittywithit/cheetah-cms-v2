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
      if (!account.accessToken || !account.pageId) {
        throw new Error('Facebook access token or page ID not configured')
      }

      const url = `https://graph.facebook.com/v18.0/${account.pageId}/feed`
      
      const postData: Record<string, unknown> = {
        message: post.content + '\n\n' + post.hashtags.join(' '),
        access_token: account.accessToken
      }

      // Add media if provided
      if (mediaUrls && mediaUrls.length > 0) {
        if (mediaUrls.length === 1) {
          // Single image
          postData.link = mediaUrls[0]
        } else {
          // Multiple images - would need to upload to Facebook first
          // For now, just use the first image
          postData.link = mediaUrls[0]
        }
      }

      // Handle scheduled posts
      if (post.scheduledFor && new Date(post.scheduledFor) > new Date()) {
        postData.published = false
        postData.scheduled_publish_time = Math.floor(new Date(post.scheduledFor).getTime() / 1000)
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Facebook API error')
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

  // Instagram API Integration (Basic Display API)
  static async postToInstagram(
    _post: SocialPost,
    account: SocialAccount,
    _mediaUrls?: string[]
  ): Promise<PostResponse> {
    try {
      if (!account.accessToken) {
        throw new Error('Instagram access token not configured')
      }

      // Instagram posting requires the Instagram Graph API (business accounts)
      // For now, return a placeholder response
      return {
        success: false,
        error: 'Instagram API integration coming soon - requires Instagram Business account setup'
      }

    } catch (error) {
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
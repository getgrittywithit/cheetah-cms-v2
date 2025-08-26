import { R2ImageUploader } from './r2-upload'

interface InstagramPostResult {
  success: boolean
  postId?: string
  error?: string
  mediaId?: string
}

interface InstagramMediaContainer {
  id: string
  status: 'IN_PROGRESS' | 'FINISHED' | 'ERROR'
}

export class InstagramService {
  
  /**
   * Complete Instagram posting flow:
   * 1. Upload image to R2 bucket
   * 2. Create Instagram media container 
   * 3. Wait for container to be ready
   * 4. Publish the post
   */
  static async postToInstagram(
    imageUrl: string | null,
    caption: string,
    hashtags: string[],
    accessToken: string,
    accountId: string,
    brandSlug: string
  ): Promise<InstagramPostResult> {
    try {
      console.log('🔵 Starting Instagram posting flow...', {
        hasImage: !!imageUrl,
        captionLength: caption.length,
        hashtagCount: hashtags.length,
        accountId: accountId,
        accessTokenLength: accessToken.length,
        brandSlug,
        imageUrl: imageUrl?.substring(0, 100) + '...'
      })

      // Step 1: Upload image to R2 (if we have an image)
      let publicImageUrl = imageUrl
      
      if (imageUrl && imageUrl.includes('oaidalleapiprodscus.blob.core.windows.net')) {
        console.log('🔵 Step 1: Uploading DALL-E image to brand-specific R2...')
        const uploader = new R2ImageUploader(brandSlug)
        const uploadResult = await uploader.uploadImageFromUrl(imageUrl, `instagram-${brandSlug}-${Date.now()}`)
        
        if (!uploadResult.success) {
          throw new Error(`Failed to upload image to R2: ${uploadResult.error}`)
        }
        
        publicImageUrl = uploadResult.url
        console.log('🟢 Image uploaded to brand R2:', publicImageUrl)
      }

      // Instagram requires an image for posts
      if (!publicImageUrl) {
        throw new Error('Instagram posts require an image')
      }

      // Step 2: Create Instagram media container
      console.log('🔵 Step 2: Creating Instagram media container...')
      const containerResult = await this.createMediaContainer(
        publicImageUrl,
        caption,
        hashtags,
        accessToken,
        accountId
      )

      if (!containerResult.success || !containerResult.mediaId) {
        throw new Error(`Failed to create media container: ${containerResult.error}`)
      }

      console.log('🟢 Media container created:', containerResult.mediaId)

      // Step 3: Wait for container to be ready
      console.log('🔵 Step 3: Waiting for media container to be ready...')
      const isReady = await this.waitForContainerReady(containerResult.mediaId, accessToken, 30) // 30 second timeout

      if (!isReady) {
        throw new Error('Media container failed to process within timeout period')
      }

      console.log('🟢 Media container is ready')

      // Step 4: Publish the post
      console.log('🔵 Step 4: Publishing Instagram post...')
      const publishResult = await this.publishMediaContainer(containerResult.mediaId, accessToken, accountId)

      if (!publishResult.success) {
        throw new Error(`Failed to publish post: ${publishResult.error}`)
      }

      console.log('🟢 Instagram post published successfully!', publishResult.postId)

      return {
        success: true,
        postId: publishResult.postId,
        mediaId: containerResult.mediaId
      }

    } catch (error) {
      console.error('🔴 Instagram posting failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Step 2: Create Instagram media container
   */
  private static async createMediaContainer(
    imageUrl: string,
    caption: string,
    hashtags: string[],
    accessToken: string,
    accountId: string
  ): Promise<InstagramPostResult> {
    try {
      const fullCaption = caption + '\n\n' + hashtags.join(' ')
      const url = `https://graph.facebook.com/v18.0/${accountId}/media`
      
      // Instagram API expects form data, not JSON
      const formData = new URLSearchParams()
      formData.append('image_url', imageUrl)
      formData.append('caption', fullCaption)
      formData.append('access_token', accessToken)

      console.log('🔵 Creating media container with:', {
        url,
        imageUrl: imageUrl.substring(0, 50) + '...',
        captionLength: fullCaption.length,
        accessTokenPrefix: accessToken.substring(0, 20) + '...',
        formDataString: formData.toString().substring(0, 200) + '...'
      })

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      })

      const data = await response.json()
      
      console.log('🔵 Media container response:', {
        status: response.status,
        ok: response.ok,
        data
      })

      if (!response.ok) {
        console.error('🔴 Media container creation failed:', data)
        const errorMessage = data.error?.error_user_msg || data.error?.message || `Instagram API error: ${response.status}`
        throw new Error(`Instagram media container failed: ${errorMessage}`)
      }

      if (!data.id) {
        console.error('🔴 No media ID returned:', data)
        throw new Error('Instagram API did not return media container ID')
      }

      return {
        success: true,
        mediaId: data.id
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Step 3: Wait for media container to be ready
   */
  private static async waitForContainerReady(
    mediaId: string,
    accessToken: string,
    timeoutSeconds: number = 30
  ): Promise<boolean> {
    const startTime = Date.now()
    const timeoutMs = timeoutSeconds * 1000

    while (Date.now() - startTime < timeoutMs) {
      try {
        const status = await this.checkContainerStatus(mediaId, accessToken)
        
        console.log('🔵 Container status:', status)
        
        if (status === 'FINISHED') {
          return true
        }
        
        if (status === 'ERROR') {
          console.error('🔴 Media container processing failed')
          return false
        }

        // Wait 2 seconds before checking again
        await new Promise(resolve => setTimeout(resolve, 2000))
        
      } catch (error) {
        console.error('🔴 Error checking container status:', error)
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    console.error('🔴 Timeout waiting for media container to be ready')
    return false
  }

  /**
   * Check Instagram media container status
   */
  private static async checkContainerStatus(
    mediaId: string,
    accessToken: string
  ): Promise<string> {
    const url = `https://graph.facebook.com/v18.0/${mediaId}?fields=status&access_token=${accessToken}`
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to check container status')
    }

    return data.status || 'UNKNOWN'
  }

  /**
   * Step 4: Publish the media container
   */
  private static async publishMediaContainer(
    mediaId: string,
    accessToken: string,
    accountId: string
  ): Promise<InstagramPostResult> {
    try {
      const url = `https://graph.facebook.com/v18.0/${accountId}/media_publish`
      
      const formData = new URLSearchParams()
      formData.append('creation_id', mediaId)
      formData.append('access_token', accessToken)

      console.log('🔵 Publishing media container:', {
        url,
        mediaId,
        accountId: accountId.substring(0, 8) + '...'
      })

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      })

      const data = await response.json()
      
      console.log('🔵 Publish response:', {
        status: response.status,
        ok: response.ok,
        data
      })

      if (!response.ok) {
        throw new Error(data.error?.message || `Instagram publish error: ${response.status}`)
      }

      return {
        success: true,
        postId: data.id
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getBrandConfig } from '@/lib/brand-config'
import { InstagramService } from '@/lib/instagram-service'

export async function GET(request: NextRequest) {
  try {
    const brandConfig = getBrandConfig('daily-dish-dash')
    if (!brandConfig) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    const accessToken = brandConfig.socialTokens.instagram
    const accountId = brandConfig.socialTokens.instagramAccountId

    if (!accessToken || !accountId) {
      return NextResponse.json({
        error: 'Missing Instagram credentials',
        hasAccessToken: !!accessToken,
        hasAccountId: !!accountId
      }, { status: 400 })
    }

    // Test with a DALL-E-style URL to simulate the real flow
    // This will trigger the R2 upload process just like real posts
    const testDalleUrl = 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-test/test-image.png'
    const testCaption = 'Test post from Daily Dish Dash API 🧪'
    const testHashtags = ['#test', '#dailydishdash', '#api']

    console.log('🔵 Testing complete Instagram flow with simulated DALL-E URL:', {
      simulatedDalleUrl: testDalleUrl,
      caption: testCaption,
      hashtags: testHashtags,
      accountId: accountId,
      willTriggerR2Upload: testDalleUrl.includes('oaidalleapiprodscus.blob.core.windows.net')
    })

    // Since we can't use a real DALL-E URL in testing, let's use a direct R2 approach
    // First, let's create a simple test image and upload it to R2
    const testImageResponse = await fetch('https://via.placeholder.com/1080x1080.jpg')
    if (!testImageResponse.ok) {
      throw new Error('Failed to fetch test image')
    }

    const testImageBuffer = await testImageResponse.arrayBuffer()
    
    // Upload to R2 using the brand-specific uploader
    const { R2ImageUploader } = await import('@/lib/r2-upload')
    const uploader = new R2ImageUploader('daily-dish-dash')
    
    const uploadResult = await uploader.uploadImageBuffer(
      testImageBuffer, 
      `instagram-test-${Date.now()}.jpg`,
      'image/jpeg'
    )

    if (!uploadResult.success) {
      throw new Error(`R2 upload failed: ${uploadResult.error}`)
    }

    console.log('🔵 Test image uploaded to R2:', uploadResult.url)

    const result = await InstagramService.postToInstagram(
      uploadResult.url, // Use the R2 URL
      testCaption,
      testHashtags,
      accessToken,
      accountId,
      'daily-dish-dash'
    )

    console.log('🔵 Instagram test result:', result)

    return NextResponse.json({
      success: result.success,
      result: result,
      testDetails: {
        r2Upload: {
          success: uploadResult.success,
          url: uploadResult.url,
          key: uploadResult.key
        },
        instagramPost: {
          caption: testCaption,
          hashtags: testHashtags,
          accountId: accountId,
          accessTokenLength: accessToken.length,
          finalImageUrl: uploadResult.url
        }
      }
    })

  } catch (error) {
    console.error('🔴 Instagram real test error:', error)
    
    // More detailed error information
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      cause: error instanceof Error ? error.cause : undefined
    }
    
    return NextResponse.json({
      error: errorDetails.message,
      errorDetails: errorDetails,
      debugInfo: {
        hasAccessToken: !!accessToken,
        hasAccountId: !!accountId,
        brandConfig: !!brandConfig
      }
    }, { status: 500 })
  }
}
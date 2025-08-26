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

    // Test with a real image URL that should work with Instagram
    // This is a sample food image from Lorem Picsum
    const testImageUrl = 'https://picsum.photos/1080/1080?random=1'
    const testCaption = 'Test post from Daily Dish Dash API 🧪'
    const testHashtags = ['#test', '#dailydishdash', '#api']

    console.log('🔵 Testing Instagram posting with real image:', {
      imageUrl: testImageUrl,
      caption: testCaption,
      hashtags: testHashtags,
      accountId: accountId
    })

    const result = await InstagramService.postToInstagram(
      testImageUrl,
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
        imageUrl: testImageUrl,
        caption: testCaption,
        hashtags: testHashtags,
        accountId: accountId,
        accessTokenLength: accessToken.length
      }
    })

  } catch (error) {
    console.error('🔴 Instagram real test error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getBrandConfig } from '@/lib/brand-config'

export async function GET(request: NextRequest) {
  try {
    const brandConfig = getBrandConfig('daily-dish-dash')
    if (!brandConfig) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    const accessToken = brandConfig.socialTokens.instagram
    const accountId = brandConfig.socialTokens.instagramAccountId

    console.log('🔵 Instagram Test Debug Info:', {
      hasAccessToken: !!accessToken,
      accessTokenLength: accessToken?.length,
      accessTokenPrefix: accessToken?.substring(0, 30) + '...',
      hasAccountId: !!accountId,
      accountId: accountId,
      brandName: brandConfig.name
    })

    // Test 1: Basic Instagram API call - get account info
    if (!accessToken || !accountId) {
      return NextResponse.json({
        error: 'Missing Instagram credentials',
        hasAccessToken: !!accessToken,
        hasAccountId: !!accountId
      }, { status: 400 })
    }

    const testUrl = `https://graph.facebook.com/v18.0/${accountId}?fields=id,username,name,profile_picture_url&access_token=${accessToken}`
    
    console.log('🔵 Testing Instagram API with URL:', testUrl.replace(accessToken, 'TOKEN_HIDDEN'))
    
    const response = await fetch(testUrl)
    const data = await response.json()
    
    console.log('🔵 Instagram API Test Response:', {
      status: response.status,
      ok: response.ok,
      data: data
    })

    // Test 2: Check if we can access the media endpoint (without actually posting)
    const mediaEndpointUrl = `https://graph.facebook.com/v18.0/${accountId}/media`
    
    const testMediaContainer = await fetch(mediaEndpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        image_url: 'https://via.placeholder.com/400x400.png?text=Test+Image',
        caption: 'Test caption for API verification',
        access_token: accessToken
      }).toString()
    })

    const mediaData = await testMediaContainer.json()
    
    console.log('🔵 Media container test response:', {
      status: testMediaContainer.status,
      ok: testMediaContainer.ok,
      data: mediaData
    })

    return NextResponse.json({
      accountTest: {
        success: response.ok,
        status: response.status,
        data: data
      },
      mediaContainerTest: {
        success: testMediaContainer.ok,
        status: testMediaContainer.status,
        data: mediaData
      },
      debugInfo: {
        hasAccessToken: !!accessToken,
        accessTokenLength: accessToken.length,
        accountId: accountId,
        brandName: brandConfig.name,
        testUrls: {
          account: testUrl.replace(accessToken, 'TOKEN_HIDDEN'),
          media: mediaEndpointUrl
        }
      }
    })

  } catch (error) {
    console.error('🔴 Instagram test error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
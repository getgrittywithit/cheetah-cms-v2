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

    const testUrl = `https://graph.facebook.com/v18.0/${accountId}?fields=id,username,account_type&access_token=${accessToken}`
    
    console.log('🔵 Testing Instagram API with URL:', testUrl.replace(accessToken, 'TOKEN_HIDDEN'))
    
    const response = await fetch(testUrl)
    const data = await response.json()
    
    console.log('🔵 Instagram API Test Response:', {
      status: response.status,
      ok: response.ok,
      data: data
    })

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      accountInfo: data,
      testUrl: testUrl.replace(accessToken, 'TOKEN_HIDDEN'),
      debugInfo: {
        hasAccessToken: !!accessToken,
        accessTokenLength: accessToken.length,
        accountId: accountId,
        brandName: brandConfig.name
      }
    })

  } catch (error) {
    console.error('🔴 Instagram test error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
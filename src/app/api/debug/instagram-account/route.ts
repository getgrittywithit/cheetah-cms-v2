import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get brand from query params
    const searchParams = request.nextUrl.searchParams
    const brand = searchParams.get('brand') || 'triton-handyman'
    
    // Get the Facebook token based on brand
    let pageAccessToken: string | undefined
    let pageId: string | undefined
    
    switch(brand) {
      case 'triton-handyman':
        pageAccessToken = process.env.TRITON_HANDYMAN_FACEBOOK_PAGE_ACCESS_TOKEN
        pageId = process.env.TRITON_HANDYMAN_FACEBOOK_PAGE_ID
        break
      case 'forbidden-files':
        pageAccessToken = process.env.FORBIDDEN_FILES_FACEBOOK_PAGE_ACCESS_TOKEN
        pageId = process.env.FORBIDDEN_FILES_FACEBOOK_PAGE_ID
        break
      case 'daily-dish-dash':
        pageAccessToken = process.env.DAILY_DISH_FACEBOOK_PAGE_ACCESS_TOKEN
        pageId = process.env.DAILY_DISH_FACEBOOK_PAGE_ID
        break
      case 'grit-collective':
        pageAccessToken = process.env.GRIT_COLLECTIVE_FACEBOOK_TOKEN
        pageId = process.env.GRIT_COLLECTIVE_FACEBOOK_PAGE_ID
        break
      default:
        return NextResponse.json({ error: 'Invalid brand' }, { status: 400 })
    }

    if (!pageAccessToken || !pageId) {
      return NextResponse.json({ 
        error: 'Missing token or page ID for brand',
        brand,
        hasToken: !!pageAccessToken,
        hasPageId: !!pageId
      }, { status: 400 })
    }

    // Query Facebook Graph API to get Instagram Business Account
    const url = `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account,name&access_token=${pageAccessToken}`
    
    console.log('🔵 Fetching Instagram account for brand:', brand)
    console.log('🔵 Page ID:', pageId)
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json({
        error: 'Facebook API error',
        details: data,
        brand
      }, { status: response.status })
    }

    // If Instagram account is connected, get more details
    let instagramDetails = null
    if (data.instagram_business_account?.id) {
      const igUrl = `https://graph.facebook.com/v18.0/${data.instagram_business_account.id}?fields=id,username,name,profile_picture_url&access_token=${pageAccessToken}`
      const igResponse = await fetch(igUrl)
      instagramDetails = await igResponse.json()
    }

    return NextResponse.json({
      success: true,
      brand,
      facebookPage: {
        id: pageId,
        name: data.name
      },
      instagramAccount: data.instagram_business_account ? {
        id: data.instagram_business_account.id,
        username: instagramDetails?.username,
        name: instagramDetails?.name,
        profilePicture: instagramDetails?.profile_picture_url,
        configuredId: process.env[`${brand.toUpperCase().replace(/-/g, '_')}_INSTAGRAM_ACCOUNT_ID`]
      } : null,
      message: data.instagram_business_account ? 
        `Instagram account found! Use this ID: ${data.instagram_business_account.id}` : 
        'No Instagram Business Account connected to this Facebook Page. Please connect one in Facebook Page settings.'
    })

  } catch (error) {
    console.error('🔴 Error fetching Instagram account:', error)
    return NextResponse.json({
      error: 'Failed to fetch Instagram account',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
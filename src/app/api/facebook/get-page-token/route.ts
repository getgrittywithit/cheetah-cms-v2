import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userToken = searchParams.get('user_token')
  
  if (!userToken) {
    return NextResponse.json({
      error: 'Missing user_token parameter',
      instructions: [
        '1. Go to https://developers.facebook.com/tools/explorer/',
        '2. Select your app (Gritty Systems)',
        '3. Click "Get Token" → "Get User Access Token"',
        '4. Select permissions: pages_show_list, pages_manage_posts, pages_read_engagement',
        '5. Copy the generated token',
        '6. Visit: /api/facebook/get-page-token?user_token=YOUR_TOKEN_HERE'
      ]
    }, { status: 400 })
  }

  try {
    // Get user's pages
    const pagesResponse = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${userToken}`)
    const pagesData = await pagesResponse.json()

    if (!pagesResponse.ok) {
      throw new Error(pagesData.error?.message || 'Failed to fetch pages')
    }

    // Find Daily Dish Dash page
    const dailyDishPage = pagesData.data?.find((page: any) => 
      page.name.includes('Daily Dish') || page.id === '605708122630363'
    )

    if (!dailyDishPage) {
      return NextResponse.json({
        error: 'Daily Dish Dash page not found',
        availablePages: pagesData.data?.map((page: any) => ({
          id: page.id,
          name: page.name,
          category: page.category
        })) || [],
        instructions: 'Make sure you have admin access to the Daily Dish Dash Facebook page'
      }, { status: 404 })
    }

    // Get long-lived token for the page
    const longLivedResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=1620396625340168&client_secret=c84b7dafabe1a78deca41ca6ec49b60b&fb_exchange_token=${dailyDishPage.access_token}`
    )
    const longLivedData = await longLivedResponse.json()

    const finalToken = longLivedData.access_token || dailyDishPage.access_token

    return NextResponse.json({
      success: true,
      pageInfo: {
        id: dailyDishPage.id,
        name: dailyDishPage.name,
        category: dailyDishPage.category
      },
      tokens: {
        shortLived: dailyDishPage.access_token,
        longLived: finalToken,
        recommended: finalToken
      },
      instructions: [
        'Copy the "recommended" token above',
        'Update DAILY_DISH_FACEBOOK_PAGE_ACCESS_TOKEN in Vercel with this token',
        'This token should last much longer than the previous one'
      ]
    })

  } catch (error) {
    console.error('Token generation error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      troubleshooting: [
        'Make sure you have admin access to Daily Dish Dash page',
        'Verify the user token has the required permissions',
        'Check that your Facebook app is properly configured'
      ]
    }, { status: 500 })
  }
}
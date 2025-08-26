import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get Daily Dish Dash brand with social accounts
    const { data: brands, error } = await supabaseAdmin
      .from('brand_profiles')
      .select(`
        id,
        name,
        social_accounts (
          platform,
          account_id,
          access_token,
          account_handle,
          is_active,
          posting_enabled
        )
      `)
      .eq('name', 'Daily Dish Dash')
    
    if (error) {
      throw error
    }

    if (!brands || brands.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Daily Dish Dash brand not found'
      })
    }

    const brand = brands[0]
    const facebookAccount = brand.social_accounts?.find((acc: any) => acc.platform === 'facebook')

    return NextResponse.json({
      success: true,
      debug: {
        brandId: brand.id,
        brandName: brand.name,
        totalSocialAccounts: brand.social_accounts?.length || 0,
        facebookAccount: facebookAccount ? {
          platform: facebookAccount.platform,
          hasAccessToken: !!facebookAccount.access_token,
          accessTokenLength: facebookAccount.access_token?.length || 0,
          hasPageId: !!facebookAccount.account_id,
          pageId: facebookAccount.account_id,
          isActive: facebookAccount.is_active,
          postingEnabled: facebookAccount.posting_enabled,
          handle: facebookAccount.account_handle
        } : null,
        allPlatforms: brand.social_accounts?.map((acc: any) => acc.platform) || [],
        environmentCheck: {
          hasFacebookToken: !!process.env.DAILY_DISH_FACEBOOK_PAGE_ACCESS_TOKEN,
          hasPageId: !!process.env.DAILY_DISH_FACEBOOK_PAGE_ID,
          tokenLength: process.env.DAILY_DISH_FACEBOOK_PAGE_ACCESS_TOKEN?.length || 0
        }
      }
    })

  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get the current Facebook token from database
    const { data, error } = await supabaseAdmin
      .from('social_accounts')
      .select('access_token, updated_at, is_active')
      .eq('platform', 'facebook')
      .eq('account_id', '605708122630363')
      .single()

    if (error) {
      throw error
    }

    if (!data) {
      return NextResponse.json({
        error: 'Facebook account not found in database'
      }, { status: 404 })
    }

    // Test the token with Facebook API
    const testResponse = await fetch(
      `https://graph.facebook.com/v19.0/me?access_token=${data.access_token}`
    )
    const testData = await testResponse.json()

    return NextResponse.json({
      success: true,
      tokenInfo: {
        hasToken: !!data.access_token,
        tokenLength: data.access_token?.length || 0,
        tokenStart: data.access_token?.substring(0, 20) + '...',
        lastUpdated: data.updated_at,
        isActive: data.is_active
      },
      facebookResponse: {
        status: testResponse.status,
        ok: testResponse.ok,
        data: testData
      }
    })

  } catch (error) {
    console.error('Token check error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
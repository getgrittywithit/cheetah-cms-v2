import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    
    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    // Update the Facebook access token for Daily Dish Dash
    const { data, error } = await supabaseAdmin
      .from('social_accounts')
      .update({ 
        access_token: token,
        updated_at: new Date().toISOString()
      })
      .eq('platform', 'facebook')
      .eq('account_id', '605708122630363')
      .select()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Facebook token updated successfully',
      updated: data?.length || 0
    })

  } catch (error) {
    console.error('Token update error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
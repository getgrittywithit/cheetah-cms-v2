import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  return await updateToken()
}

export async function POST(request: NextRequest) {
  return await updateToken()
}

async function updateToken() {
  try {
    const workingToken = "EAAXBvf0ZCpwgBPcR5aIerddHQYWBmANVhp2uqQlOTZCQAaZBccZCr92Ri591jSbyj0dhVw8lDZAQ5wkllwYenDihRnvaXHW8zGdrIFtoDiZAut39AvRkZAgJMlAgjqa6rzoUlYhge6QrYXPre5tWpjmQDw43xBIRMq5RtvLu6HEYliW8cCnP0WhtiefkbxqeIEPYjRZC6PnOsoWQk60Ub9ZCSol0W"

    // First, let's see what's in the database
    const { data: existing, error: selectError } = await supabaseAdmin
      .from('social_accounts')
      .select('*')
      .eq('platform', 'facebook')

    console.log('Existing Facebook accounts:', existing)

    if (selectError) {
      console.error('Select error:', selectError)
    }

    // Update ALL Facebook accounts with the working token
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('social_accounts')
      .update({ 
        access_token: workingToken,
        updated_at: new Date().toISOString(),
        is_active: true,
        posting_enabled: true
      })
      .eq('platform', 'facebook')
      .select()

    console.log('Update result:', updated)

    if (updateError) {
      console.error('Update error:', updateError)
      throw updateError
    }

    // Test the token immediately
    const testResponse = await fetch(
      `https://graph.facebook.com/v19.0/605708122630363?access_token=${workingToken}`
    )
    const testData = await testResponse.json()

    return NextResponse.json({
      success: true,
      message: 'Forced token update complete',
      details: {
        existingAccounts: existing?.length || 0,
        updatedAccounts: updated?.length || 0,
        tokenTest: {
          status: testResponse.status,
          ok: testResponse.ok,
          data: testData
        }
      }
    })

  } catch (error) {
    console.error('Force update error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
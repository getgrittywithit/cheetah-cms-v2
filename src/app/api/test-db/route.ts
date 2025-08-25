import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Test simple query
    const { data, error } = await supabase
      .from('brand_profiles')
      .select('*')
      .limit(1)
    
    if (error) {
      return NextResponse.json({
        error: 'Database error',
        details: error.message,
        code: error.code,
        hint: error.hint
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database connection works',
      data: data
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Connection error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export async function POST() {
  try {
    // Test simple insert
    const { data, error } = await supabase
      .from('brand_profiles')
      .insert({
        user_id: 'test-user-123',
        name: 'Test Brand',
        description: 'Test Description'
      })
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({
        error: 'Insert error',
        details: error.message,
        code: error.code,
        hint: error.hint,
        fullError: error
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Insert successful',
      data: data
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Insert exception',
      details: error instanceof Error ? error.message : 'Unknown error',
      fullError: error
    })
  }
}
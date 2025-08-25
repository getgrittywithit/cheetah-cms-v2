import { NextResponse } from 'next/server'

export async function GET() {
  // Check which environment variables are available
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
  const keyLength = process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0
  
  return NextResponse.json({
    hasServiceKey,
    keyLength,
    // Show first/last 10 chars for verification (safe to show)
    keyPreview: hasServiceKey 
      ? `${process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 10)}...${process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(-10)}`
      : 'NOT SET',
    nodeEnv: process.env.NODE_ENV
  })
}
import { NextRequest, NextResponse } from 'next/server'
import { listBuckets } from '@/lib/r2-client'

export async function GET(request: NextRequest) {
  try {
    const buckets = await listBuckets()

    return NextResponse.json({
      success: true,
      buckets,
      currentBucket: process.env.R2_BUCKET_NAME || 'dailydishdash'
    })
  } catch (error) {
    console.error('List buckets error:', error)
    return NextResponse.json(
      { error: 'Failed to list buckets' },
      { status: 500 }
    )
  }
}
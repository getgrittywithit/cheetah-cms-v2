import { NextRequest, NextResponse } from 'next/server'
import { listBuckets } from '@/lib/r2-client'

export async function GET(request: NextRequest) {
  try {
    const buckets = await listBuckets()

    return NextResponse.json({
      success: true,
      buckets,
      currentBucket: process.env.R2_BUCKET_NAME || 'cheetah-content-media',
      totalBuckets: buckets.length,
      credentials: {
        hasAccountId: !!process.env.R2_ACCOUNT_ID,
        hasAccessKey: !!process.env.R2_ACCESS_KEY_ID,
        hasSecretKey: !!process.env.R2_SECRET_ACCESS_KEY
      }
    })
  } catch (error) {
    console.error('List buckets error:', error)
    return NextResponse.json(
      { error: 'Failed to list buckets' },
      { status: 500 }
    )
  }
}
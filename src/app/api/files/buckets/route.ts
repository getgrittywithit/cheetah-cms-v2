import { NextRequest, NextResponse } from 'next/server'
import { listBuckets } from '@/lib/r2-client'

export async function GET(request: NextRequest) {
  try {
    console.log('🔵 Attempting to list R2 buckets...')
    const buckets = await listBuckets()
    console.log('🔵 Listed buckets result:', buckets)

    // Since we know cheetah-content-media works, let's hardcode it for now
    const knownBuckets = buckets.length > 0 ? buckets : ['cheetah-content-media']
    
    return NextResponse.json({
      success: true,
      buckets: knownBuckets,
      currentBucket: process.env.R2_BUCKET_NAME || 'cheetah-content-media',
      totalBuckets: knownBuckets.length,
      listBucketsWorked: buckets.length > 0,
      credentials: {
        hasAccountId: !!process.env.R2_ACCOUNT_ID,
        hasAccessKey: !!process.env.R2_ACCESS_KEY_ID,
        hasSecretKey: !!process.env.R2_SECRET_ACCESS_KEY
      },
      note: buckets.length === 0 ? 'ListBuckets permission may be missing - using known bucket' : 'Buckets listed successfully'
    })
  } catch (error) {
    console.error('List buckets error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to list buckets',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
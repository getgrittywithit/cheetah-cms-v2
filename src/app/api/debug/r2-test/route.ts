import { NextRequest, NextResponse } from 'next/server'
import { getBrandR2Config, getBrandPublicUrl, createBrandR2Client } from '@/lib/brand-r2-config'

export async function GET(request: NextRequest) {
  try {
    console.log('🔵 Starting R2 test for Daily Dish Dash...')
    
    // Test brand R2 config
    const r2Config = getBrandR2Config('daily-dish-dash')
    console.log('🔵 R2 Config:', {
      hasConfig: !!r2Config,
      hasAccountId: !!r2Config?.accountId,
      hasAccessKey: !!r2Config?.accessKeyId,
      hasSecretKey: !!r2Config?.secretAccessKey,
      bucketName: r2Config?.bucketName,
      publicUrl: r2Config?.publicUrl
    })

    if (!r2Config) {
      return NextResponse.json({
        error: 'No R2 config found for daily-dish-dash'
      }, { status: 400 })
    }

    // Test R2 client creation
    const r2Client = createBrandR2Client('daily-dish-dash')
    console.log('🔵 R2 Client created:', !!r2Client)

    if (!r2Client) {
      return NextResponse.json({
        error: 'Failed to create R2 client',
        config: {
          hasAccountId: !!r2Config.accountId,
          hasAccessKey: !!r2Config.accessKeyId,
          hasSecretKey: !!r2Config.secretAccessKey,
          bucketName: r2Config.bucketName
        }
      }, { status: 400 })
    }

    // Test public URL generation
    const testKey = `test/${Date.now()}.jpg`
    const publicUrl = getBrandPublicUrl('daily-dish-dash', testKey)
    console.log('🔵 Generated public URL:', publicUrl)

    return NextResponse.json({
      success: true,
      r2Config: {
        bucketName: r2Config.bucketName,
        publicUrl: r2Config.publicUrl,
        hasCredentials: {
          accountId: !!r2Config.accountId,
          accessKey: !!r2Config.accessKeyId,
          secretKey: !!r2Config.secretAccessKey
        }
      },
      testPublicUrl: publicUrl,
      clientCreated: !!r2Client
    })

  } catch (error) {
    console.error('🔴 R2 test error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
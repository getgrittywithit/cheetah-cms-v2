import { NextRequest, NextResponse } from 'next/server'
import { listFilesFromR2 } from '@/lib/r2-client'

export async function GET(request: NextRequest) {
  try {
    console.log('🔵 Testing R2 bucket connection...')
    
    // List all files in the bucket
    const allFiles = await listFilesFromR2()
    console.log('🔵 Found files in bucket:', allFiles.length)
    
    // List files in ai-generated folder specifically
    const aiFiles = await listFilesFromR2('ai-generated/')
    console.log('🔵 Found AI files:', aiFiles.length)
    
    return NextResponse.json({
      success: true,
      bucket: process.env.R2_BUCKET_NAME || 'dailydishdash',
      totalFiles: allFiles.length,
      aiGeneratedFiles: aiFiles.length,
      allFiles: allFiles.map(f => ({ key: f.key, size: f.size, type: f.type })),
      aiFiles: aiFiles.map(f => ({ key: f.key, size: f.size, type: f.type })),
      credentials: {
        hasAccountId: !!process.env.R2_ACCOUNT_ID,
        hasAccessKey: !!process.env.R2_ACCESS_KEY_ID,
        hasSecretKey: !!process.env.R2_SECRET_ACCESS_KEY,
        bucketName: process.env.R2_BUCKET_NAME
      }
    })
  } catch (error) {
    console.error('🔴 R2 test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      credentials: {
        hasAccountId: !!process.env.R2_ACCOUNT_ID,
        hasAccessKey: !!process.env.R2_ACCESS_KEY_ID,
        hasSecretKey: !!process.env.R2_SECRET_ACCESS_KEY,
        bucketName: process.env.R2_BUCKET_NAME
      }
    }, { status: 500 })
  }
}
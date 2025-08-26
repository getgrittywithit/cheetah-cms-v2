import { NextRequest, NextResponse } from 'next/server'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getBrandR2Config, createBrandR2Client } from '@/lib/brand-r2-config'
import { getBrandConfig } from '@/lib/brand-config'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { brand: string } }
) {
  try {
    const { brand } = params
    
    // Validate brand exists
    const brandConfig = getBrandConfig(brand)
    if (!brandConfig) {
      return NextResponse.json(
        { error: 'Invalid brand' },
        { status: 404 }
      )
    }
    
    const { key } = await request.json()
    
    if (!key) {
      return NextResponse.json(
        { error: 'No file key provided' },
        { status: 400 }
      )
    }
    
    // Get brand-specific R2 configuration
    const r2Config = getBrandR2Config(brand)
    const r2Client = createBrandR2Client(brand)
    
    if (!r2Client || !r2Config) {
      return NextResponse.json(
        { error: 'R2 storage not configured for this brand' },
        { status: 500 }
      )
    }
    
    const command = new DeleteObjectCommand({
      Bucket: r2Config.bucketName,
      Key: key,
    })
    
    try {
      await r2Client.send(command)
      
      return NextResponse.json({
        success: true,
        message: 'File deleted successfully'
      })
    } catch (error) {
      console.error(`R2 delete error for ${brand}:`, error)
      return NextResponse.json({
        success: false,
        error: 'Failed to delete file',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Delete API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
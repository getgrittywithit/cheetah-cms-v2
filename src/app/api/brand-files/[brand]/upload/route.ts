import { NextRequest, NextResponse } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getBrandR2Config, createBrandR2Client, getBrandPublicUrl } from '@/lib/brand-r2-config'
import { getBrandConfig } from '@/lib/brand-config'

export async function POST(
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
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'uploads'
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
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
    
    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split('.').pop()
    const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase()
    const key = `${folder}/${timestamp}-${randomString}-${cleanName}.${extension}`
    
    // Convert file to buffer
    const buffer = await file.arrayBuffer()
    
    const command = new PutObjectCommand({
      Bucket: r2Config.bucketName,
      Key: key,
      Body: Buffer.from(buffer),
      ContentType: file.type,
    })
    
    try {
      await r2Client.send(command)
      
      return NextResponse.json({
        success: true,
        file: {
          key,
          size: file.size,
          type: file.type,
          url: getBrandPublicUrl(brand, key),
          filename: file.name
        }
      })
    } catch (error) {
      console.error(`R2 upload error for ${brand}:`, error)
      return NextResponse.json({
        success: false,
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
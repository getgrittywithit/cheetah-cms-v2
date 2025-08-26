import { NextRequest, NextResponse } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getBrandR2Config, createBrandR2Client } from '@/lib/brand-r2-config'
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
    
    const { folderName } = await request.json()
    
    if (!folderName || typeof folderName !== 'string') {
      return NextResponse.json(
        { error: 'Folder name is required' },
        { status: 400 }
      )
    }
    
    // Sanitize folder name
    const sanitizedName = folderName
      .replace(/[^a-zA-Z0-9-_\s]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase()
      .trim()
    
    if (!sanitizedName) {
      return NextResponse.json(
        { error: 'Invalid folder name' },
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
    
    // Create a placeholder file to represent the folder
    // R2/S3 doesn't have true folders, so we create an empty object with a trailing slash
    const folderKey = `${sanitizedName}/`
    
    const command = new PutObjectCommand({
      Bucket: r2Config.bucketName,
      Key: folderKey,
      Body: Buffer.from(''), // Empty content
      ContentType: 'application/x-directory',
    })
    
    try {
      await r2Client.send(command)
      
      return NextResponse.json({
        success: true,
        folder: {
          name: sanitizedName,
          originalName: folderName,
          key: folderKey
        }
      })
    } catch (error) {
      console.error(`R2 folder creation error for ${brand}:`, error)
      return NextResponse.json({
        success: false,
        error: 'Failed to create folder',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Create folder API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
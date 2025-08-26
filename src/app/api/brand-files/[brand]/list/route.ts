import { NextRequest, NextResponse } from 'next/server'
import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3'
import { getBrandR2Config, createBrandR2Client, getBrandPublicUrl } from '@/lib/brand-r2-config'
import { getBrandConfig } from '@/lib/brand-config'

interface FileItem {
  key: string
  size: number
  type: string
  lastModified: Date
  url: string
  folder: string
  filename: string
}

function guessContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'webp':
      return 'image/webp'
    case 'gif':
      return 'image/gif'
    case 'mp4':
      return 'video/mp4'
    case 'pdf':
      return 'application/pdf'
    default:
      return 'application/octet-stream'
  }
}

export async function GET(
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
    
    // Get brand-specific R2 configuration
    const r2Config = getBrandR2Config(brand)
    const r2Client = createBrandR2Client(brand)
    
    if (!r2Client || !r2Config) {
      console.error(`Missing R2 configuration for brand: ${brand}`)
      return NextResponse.json({
        success: true,
        files: [],
        message: 'R2 credentials not configured for this brand. Add the following environment variables:\n' +
          `DAILY_DISH_R2_ACCOUNT_ID\n` +
          `DAILY_DISH_R2_ACCESS_KEY_ID\n` +
          `DAILY_DISH_R2_SECRET_ACCESS_KEY`
      })
    }
    
    const command = new ListObjectsV2Command({
      Bucket: r2Config.bucketName,
      MaxKeys: 1000,
    })
    
    try {
      const response = await r2Client.send(command)
      
      if (!response.Contents) {
        return NextResponse.json({
          success: true,
          files: [],
          bucket: r2Config.bucketName
        })
      }
      
      const files: FileItem[] = response.Contents.map((obj) => {
        const key = obj.Key || ''
        const parts = key.split('/')
        const filename = parts[parts.length - 1]
        const folder = parts.length > 1 ? parts.slice(0, -1).join('/') : 'root'
        
        return {
          key,
          size: obj.Size || 0,
          type: guessContentType(filename),
          lastModified: obj.LastModified || new Date(),
          url: getBrandPublicUrl(brand, key),
          folder,
          filename
        }
      })
      
      // Extract unique folders
      const folders = Array.from(new Set(files.map(file => file.folder)))
      
      return NextResponse.json({
        success: true,
        files,
        folders,
        bucket: r2Config.bucketName,
        totalSize: files.reduce((sum, file) => sum + file.size, 0)
      })
    } catch (error) {
      console.error(`R2 list error for ${brand}:`, error)
      
      // Check if it's an authentication error
      if (error instanceof Error && error.message.includes('InvalidAccessKeyId')) {
        return NextResponse.json({
          success: false,
          error: 'Invalid R2 access credentials',
          message: 'Please check your R2 API credentials for this brand'
        }, { status: 401 })
      }
      
      return NextResponse.json({
        success: false,
        error: 'Failed to list files',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Brand files API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getBrandR2Config, getBrandPublicUrl, createBrandR2Client } from './brand-r2-config'

interface R2UploadResult {
  success: boolean
  url?: string
  key?: string
  error?: string
}

export class R2ImageUploader {
  private s3Client: S3Client
  private brandSlug: string
  private r2Config: any

  constructor(brandSlug: string = 'daily-dish-dash') {
    this.brandSlug = brandSlug
    this.r2Config = getBrandR2Config(brandSlug)
    
    const client = createBrandR2Client(brandSlug)
    if (!client) {
      throw new Error(`Failed to create R2 client for brand: ${brandSlug}`)
    }
    this.s3Client = client
  }

  async uploadImageFromUrl(imageUrl: string, fileName: string): Promise<R2UploadResult> {
    try {
      console.log('🔵 Downloading image from DALL-E:', imageUrl)
      
      // Download the image from DALL-E
      const imageResponse = await fetch(imageUrl)
      if (!imageResponse.ok) {
        throw new Error(`Failed to download image: ${imageResponse.statusText}`)
      }

      const imageBuffer = await imageResponse.arrayBuffer()
      const contentType = imageResponse.headers.get('content-type') || 'image/png'
      
      console.log('🔵 Image downloaded, size:', imageBuffer.byteLength, 'bytes')

      // Generate a unique key for R2
      const timestamp = Date.now()
      const key = `ai-generated/${timestamp}-${fileName}.png`
      const bucketName = this.r2Config.bucketName

      console.log('🔵 Uploading to brand-specific R2 bucket:', {
        brand: this.brandSlug,
        bucket: bucketName,
        key: key
      })

      const uploadCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: new Uint8Array(imageBuffer),
        ContentType: contentType,
        Metadata: {
          'generated-by': 'dall-e-3',
          'upload-timestamp': timestamp.toString(),
          'brand': this.brandSlug
        },
      })

      await this.s3Client.send(uploadCommand)

      // Use brand-specific public URL
      const publicUrl = getBrandPublicUrl(this.brandSlug, key)
      
      console.log('🔵 Image uploaded successfully to R2:', publicUrl)

      return {
        success: true,
        url: publicUrl,
        key: key
      }

    } catch (error) {
      console.error('🔴 R2 upload failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async uploadImageBuffer(buffer: ArrayBuffer, fileName: string, contentType: string = 'image/png'): Promise<R2UploadResult> {
    try {
      const timestamp = Date.now()
      const key = `uploads/${timestamp}-${fileName}`
      const bucketName = this.r2Config.bucketName

      const uploadCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: new Uint8Array(buffer),
        ContentType: contentType,
        Metadata: {
          'upload-timestamp': timestamp.toString(),
          'brand': this.brandSlug
        },
      })

      await this.s3Client.send(uploadCommand)

      const publicUrl = getBrandPublicUrl(this.brandSlug, key)

      return {
        success: true,
        url: publicUrl,
        key: key
      }

    } catch (error) {
      console.error('🔴 R2 buffer upload failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}
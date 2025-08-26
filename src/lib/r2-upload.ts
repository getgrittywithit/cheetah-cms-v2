import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

interface R2UploadResult {
  success: boolean
  url?: string
  key?: string
  error?: string
}

export class R2ImageUploader {
  private s3Client: S3Client

  constructor() {
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    })
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

      console.log('🔵 Uploading to R2 bucket:', bucketName, 'key:', key)

      // Upload to R2 - use the same bucket as the main R2 client
      const bucketName = process.env.R2_BUCKET_NAME || 'cheetah-content-media'
      const uploadCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: new Uint8Array(imageBuffer),
        ContentType: contentType,
        Metadata: {
          'generated-by': 'dall-e-3',
          'upload-timestamp': timestamp.toString(),
        },
      })

      await this.s3Client.send(uploadCommand)

      // Construct the public URL using the custom domain
      const baseUrl = process.env.R2_PUBLIC_URL || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
      const publicUrl = `${baseUrl}/${key}`
      
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
      const bucketName = process.env.R2_BUCKET_NAME || 'cheetah-content-media'

      const uploadCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: new Uint8Array(buffer),
        ContentType: contentType,
        Metadata: {
          'upload-timestamp': timestamp.toString(),
        },
      })

      await this.s3Client.send(uploadCommand)

      const baseUrl = process.env.R2_PUBLIC_URL || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
      const publicUrl = `${baseUrl}/${key}`

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
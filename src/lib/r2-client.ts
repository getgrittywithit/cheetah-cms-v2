import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || ''
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || ''
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || ''
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'cheetah-content-media'

// Log configuration for debugging (remove in production)
console.log('R2 Configuration:', {
  accountId: R2_ACCOUNT_ID ? `Set (${R2_ACCOUNT_ID.substring(0, 8)}...)` : 'Missing',
  accessKeyId: R2_ACCESS_KEY_ID ? `Set (${R2_ACCESS_KEY_ID.substring(0, 8)}...)` : 'Missing',
  secretKey: R2_SECRET_ACCESS_KEY ? `Set (${R2_SECRET_ACCESS_KEY.substring(0, 8)}...)` : 'Missing',
  bucket: R2_BUCKET_NAME,
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
})

// Log all R2-related environment variables
console.log('All R2 env vars:', {
  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID ? 'Set' : 'Missing',
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID ? 'Set' : 'Missing', 
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY ? 'Set' : 'Missing',
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME ? 'Set' : 'Missing',
  R2_PUBLIC_URL: process.env.R2_PUBLIC_URL ? 'Set' : 'Missing'
})

// Initialize R2 client
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
})

export interface UploadedFile {
  key: string
  size: number
  type: string
  lastModified: Date
  url?: string
}

// Generate a unique file key
export function generateFileKey(folder: string, filename: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 8)
  const extension = filename.split('.').pop()
  const nameWithoutExtension = filename.replace(/\.[^/.]+$/, '')
  const cleanName = nameWithoutExtension.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase()
  
  return `${folder}/${timestamp}-${randomString}-${cleanName}.${extension}`
}

// Upload file to R2
export async function uploadToR2(
  file: Buffer,
  key: string,
  contentType: string
): Promise<UploadedFile> {
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    throw new Error('R2 storage credentials are not configured. Please check environment variables.')
  }

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  })

  try {
    await r2Client.send(command)
  } catch (error) {
    console.error('R2 upload error:', error)
    throw new Error(`Failed to upload to R2: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return {
    key,
    size: file.length,
    type: contentType,
    lastModified: new Date(),
  }
}

// Delete file from R2
export async function deleteFromR2(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  })

  await r2Client.send(command)
}

// List files in R2
export async function listFilesFromR2(prefix?: string): Promise<UploadedFile[]> {
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.error('R2 credentials missing - returning empty list')
    return []
  }

  const command = new ListObjectsV2Command({
    Bucket: R2_BUCKET_NAME,
    Prefix: prefix,
    MaxKeys: 1000,
  })

  try {
    const response = await r2Client.send(command)
    
    if (!response.Contents) {
      return []
    }

    return response.Contents.map((obj) => ({
      key: obj.Key || '',
      size: obj.Size || 0,
      type: 'application/octet-stream', // R2 doesn't store content type in list
      lastModified: obj.LastModified || new Date(),
    }))
  } catch (error) {
    console.error('R2 list error:', error)
    return []
  }
}

// Get signed URL for temporary access
export async function getSignedUrlFromR2(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  })

  return await getSignedUrl(r2Client, command, { expiresIn })
}

// Get public URL if bucket is public
export function getPublicUrl(key: string): string {
  const publicUrl = process.env.R2_PUBLIC_URL
  if (publicUrl) {
    return `${publicUrl}/${key}`
  }
  // Fallback to R2 subdomain URL if public access is enabled
  return `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.dev/${key}`
}
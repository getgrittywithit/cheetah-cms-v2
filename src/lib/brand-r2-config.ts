import { S3Client } from '@aws-sdk/client-s3'

// Brand-specific R2 credentials configuration
export interface BrandR2Config {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucketName: string
  publicUrl?: string
}

// Get R2 configuration for a specific brand
export function getBrandR2Config(brandSlug: string): BrandR2Config | null {
  switch (brandSlug) {
    case 'daily-dish-dash':
      return {
        accountId: process.env.DAILY_DISH_R2_ACCOUNT_ID || '',
        accessKeyId: process.env.DAILY_DISH_R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.DAILY_DISH_R2_SECRET_ACCESS_KEY || '',
        bucketName: process.env.DAILY_DISH_R2_BUCKET || 'dailydishdash',
        publicUrl: process.env.DAILY_DISH_R2_PUBLIC_URL
      }
    
    case 'grit-collective':
      return {
        accountId: process.env.GRIT_COLLECTIVE_R2_ACCOUNT_ID || process.env.R2_ACCOUNT_ID || '',
        accessKeyId: process.env.GRIT_COLLECTIVE_R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.GRIT_COLLECTIVE_R2_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY || '',
        bucketName: process.env.GRIT_COLLECTIVE_R2_BUCKET || 'grit-collective',
        publicUrl: process.env.GRIT_COLLECTIVE_R2_PUBLIC_URL || process.env.R2_PUBLIC_URL
      }
    
    default:
      // Fallback to default/Cheetah R2 credentials
      return {
        accountId: process.env.R2_ACCOUNT_ID || '',
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        bucketName: process.env.R2_BUCKET_NAME || 'cheetah-content-media',
        publicUrl: process.env.R2_PUBLIC_URL
      }
  }
}

// Create brand-specific R2 client
export function createBrandR2Client(brandSlug: string): S3Client | null {
  const config = getBrandR2Config(brandSlug)
  
  if (!config || !config.accountId || !config.accessKeyId || !config.secretAccessKey) {
    console.error(`Missing R2 credentials for brand: ${brandSlug}`)
    return null
  }
  
  return new S3Client({
    region: 'auto',
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  })
}

// Get public URL for brand bucket
export function getBrandPublicUrl(brandSlug: string, key: string): string {
  const config = getBrandR2Config(brandSlug)
  
  if (config?.publicUrl) {
    return `${config.publicUrl}/${key}`
  }
  
  // Fallback to constructed URL
  if (config?.accountId && config?.bucketName) {
    return `https://${config.accountId}.r2.cloudflarestorage.com/${config.bucketName}/${key}`
  }
  
  // Last resort - use default pattern
  return `https://pub-${config?.bucketName || 'unknown'}.r2.dev/${key}`
}
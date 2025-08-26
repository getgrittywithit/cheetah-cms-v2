export type ContentType = 'image' | 'video' | 'text' | 'carousel' | 'story' | 'reel' | 'short' | 'community'

export type PlatformFeature = 
  | 'auto_post'        // Can post automatically via API
  | 'schedule'         // Can schedule posts
  | 'analytics'        // Provides analytics data
  | 'hashtags'         // Supports hashtags
  | 'mentions'         // Supports @mentions
  | 'links'            // Allows external links
  | 'stories'          // Has story feature
  | 'live'             // Supports live streaming

export interface ContentRequirements {
  aspectRatio?: string[]          // Supported aspect ratios
  maxFileSize?: number           // Max file size in MB
  maxDuration?: number           // Max video duration in seconds
  minDuration?: number           // Min video duration in seconds
  dimensions?: {
    min?: { width: number, height: number }
    max?: { width: number, height: number }
    recommended?: { width: number, height: number }
  }
  formats?: string[]             // Supported file formats
  maxCharacters?: number         // Max caption/text length
}

export interface PlatformConfig {
  id: string
  name: string
  displayName: string
  color: string                  // Brand color
  icon: string                  // Icon identifier
  supportedTypes: ContentType[]
  features: PlatformFeature[]
  requirements: Record<ContentType, ContentRequirements>
  postingCapability: 'auto' | 'manual' | 'organize-only'
}

export const platformConfigs: Record<string, PlatformConfig> = {
  facebook: {
    id: 'facebook',
    name: 'facebook',
    displayName: 'Facebook',
    color: '#1877F2',
    icon: 'facebook',
    supportedTypes: ['image', 'video', 'text', 'carousel'],
    features: ['auto_post', 'schedule', 'analytics', 'hashtags', 'mentions', 'links'],
    postingCapability: 'auto',
    requirements: {
      image: {
        aspectRatio: ['1:1', '4:5', '16:9', '9:16'],
        maxFileSize: 4,
        formats: ['jpg', 'png', 'webp'],
        dimensions: {
          recommended: { width: 1200, height: 630 },
          min: { width: 600, height: 315 }
        },
        maxCharacters: 63206
      },
      video: {
        aspectRatio: ['1:1', '4:5', '16:9', '9:16'],
        maxFileSize: 4000,
        maxDuration: 240,
        minDuration: 1,
        formats: ['mp4', 'mov'],
        dimensions: {
          recommended: { width: 1280, height: 720 },
          min: { width: 720, height: 720 }
        },
        maxCharacters: 63206
      },
      text: {
        maxCharacters: 63206
      },
      carousel: {
        maxFileSize: 4,
        formats: ['jpg', 'png', 'webp'],
        dimensions: {
          recommended: { width: 1080, height: 1080 }
        },
        maxCharacters: 2200
      },
      story: {},
      reel: {},
      short: {},
      community: {}
    }
  },

  instagram: {
    id: 'instagram',
    name: 'instagram',
    displayName: 'Instagram',
    color: '#E4405F',
    icon: 'instagram',
    supportedTypes: ['image', 'video', 'carousel', 'story', 'reel'],
    features: ['auto_post', 'schedule', 'analytics', 'hashtags', 'mentions'],
    postingCapability: 'auto',
    requirements: {
      image: {
        aspectRatio: ['1:1', '4:5', '16:9'],
        maxFileSize: 30,
        formats: ['jpg', 'png'],
        dimensions: {
          recommended: { width: 1080, height: 1080 },
          min: { width: 320, height: 320 }
        },
        maxCharacters: 2200
      },
      video: {
        aspectRatio: ['1:1', '4:5', '16:9'],
        maxFileSize: 250,
        maxDuration: 60,
        minDuration: 3,
        formats: ['mp4', 'mov'],
        dimensions: {
          recommended: { width: 1080, height: 1080 }
        },
        maxCharacters: 2200
      },
      carousel: {
        aspectRatio: ['1:1', '4:5'],
        maxFileSize: 30,
        formats: ['jpg', 'png', 'mp4'],
        dimensions: {
          recommended: { width: 1080, height: 1080 }
        },
        maxCharacters: 2200
      },
      story: {
        aspectRatio: ['9:16'],
        maxFileSize: 30,
        maxDuration: 15,
        formats: ['jpg', 'png', 'mp4'],
        dimensions: {
          recommended: { width: 1080, height: 1920 }
        }
      },
      reel: {
        aspectRatio: ['9:16'],
        maxFileSize: 250,
        maxDuration: 90,
        minDuration: 3,
        formats: ['mp4'],
        dimensions: {
          recommended: { width: 1080, height: 1920 }
        },
        maxCharacters: 2200
      },
      text: {},
      short: {},
      community: {}
    }
  },

  twitter: {
    id: 'twitter',
    name: 'twitter',
    displayName: 'Twitter/X',
    color: '#1DA1F2',
    icon: 'twitter',
    supportedTypes: ['image', 'video', 'text'],
    features: ['auto_post', 'schedule', 'analytics', 'hashtags', 'mentions', 'links'],
    postingCapability: 'auto',
    requirements: {
      image: {
        aspectRatio: ['1:1', '2:1', '16:9'],
        maxFileSize: 5,
        formats: ['jpg', 'png', 'webp', 'gif'],
        dimensions: {
          recommended: { width: 1200, height: 675 }
        },
        maxCharacters: 280
      },
      video: {
        aspectRatio: ['1:1', '16:9', '9:16'],
        maxFileSize: 512,
        maxDuration: 140,
        formats: ['mp4', 'mov'],
        dimensions: {
          recommended: { width: 1280, height: 720 }
        },
        maxCharacters: 280
      },
      text: {
        maxCharacters: 280
      },
      carousel: {},
      story: {},
      reel: {},
      short: {},
      community: {}
    }
  },

  youtube: {
    id: 'youtube',
    name: 'youtube',
    displayName: 'YouTube',
    color: '#FF0000',
    icon: 'youtube',
    supportedTypes: ['video', 'short', 'community'],
    features: ['auto_post', 'schedule', 'analytics', 'hashtags', 'links'],
    postingCapability: 'auto',
    requirements: {
      video: {
        aspectRatio: ['16:9'],
        maxFileSize: 256000, // 256GB theoretical limit
        maxDuration: 43200, // 12 hours
        minDuration: 1,
        formats: ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm'],
        dimensions: {
          recommended: { width: 1920, height: 1080 },
          min: { width: 426, height: 240 }
        },
        maxCharacters: 5000
      },
      short: {
        aspectRatio: ['9:16'],
        maxFileSize: 256000,
        maxDuration: 60,
        minDuration: 1,
        formats: ['mp4', 'mov'],
        dimensions: {
          recommended: { width: 1080, height: 1920 }
        },
        maxCharacters: 100
      },
      community: {
        aspectRatio: ['1:1', '16:9'],
        maxFileSize: 20,
        formats: ['jpg', 'png', 'gif'],
        maxCharacters: 1000
      },
      image: {},
      text: {},
      carousel: {},
      story: {},
      reel: {}
    }
  },

  pinterest: {
    id: 'pinterest',
    name: 'pinterest',
    displayName: 'Pinterest',
    color: '#E60023',
    icon: 'pinterest',
    supportedTypes: ['image', 'video'],
    features: ['auto_post', 'schedule', 'analytics', 'hashtags', 'links'],
    postingCapability: 'auto',
    requirements: {
      image: {
        aspectRatio: ['2:3', '1:1', '9:16'],
        maxFileSize: 20,
        formats: ['jpg', 'png'],
        dimensions: {
          recommended: { width: 1000, height: 1500 },
          min: { width: 600, height: 900 }
        },
        maxCharacters: 500
      },
      video: {
        aspectRatio: ['1:1', '2:3', '9:16'],
        maxFileSize: 2000,
        maxDuration: 15,
        formats: ['mp4', 'mov'],
        dimensions: {
          recommended: { width: 1080, height: 1920 }
        },
        maxCharacters: 500
      },
      text: {},
      carousel: {},
      story: {},
      reel: {},
      short: {},
      community: {}
    }
  },

  tiktok: {
    id: 'tiktok',
    name: 'tiktok',
    displayName: 'TikTok',
    color: '#000000',
    icon: 'tiktok',
    supportedTypes: ['video'],
    features: ['schedule', 'hashtags', 'mentions'], // No auto_post
    postingCapability: 'organize-only', // Can't post via API, only organize/schedule
    requirements: {
      video: {
        aspectRatio: ['9:16', '1:1'],
        maxFileSize: 287, // 287MB for TikTok
        maxDuration: 300, // 5 minutes
        minDuration: 1,
        formats: ['mp4', 'mov'],
        dimensions: {
          recommended: { width: 1080, height: 1920 }
        },
        maxCharacters: 2200
      },
      image: {},
      text: {},
      carousel: {},
      story: {},
      reel: {},
      short: {},
      community: {}
    }
  },

  linkedin: {
    id: 'linkedin',
    name: 'linkedin',
    displayName: 'LinkedIn',
    color: '#0077B5',
    icon: 'linkedin',
    supportedTypes: ['image', 'video', 'text'],
    features: ['auto_post', 'schedule', 'analytics', 'hashtags', 'mentions', 'links'],
    postingCapability: 'manual', // Limited API access
    requirements: {
      image: {
        aspectRatio: ['1.91:1', '1:1', '4:5'],
        maxFileSize: 20,
        formats: ['jpg', 'png'],
        dimensions: {
          recommended: { width: 1200, height: 627 }
        },
        maxCharacters: 3000
      },
      video: {
        aspectRatio: ['1:1', '16:9', '9:16'],
        maxFileSize: 5000,
        maxDuration: 600, // 10 minutes
        formats: ['mp4', 'mov', 'wmv', 'flv', 'avi'],
        dimensions: {
          recommended: { width: 1280, height: 720 }
        },
        maxCharacters: 3000
      },
      text: {
        maxCharacters: 3000
      },
      carousel: {},
      story: {},
      reel: {},
      short: {},
      community: {}
    }
  }
}

// Helper functions
export function getPlatformConfig(platformId: string): PlatformConfig | null {
  return platformConfigs[platformId] || null
}

export function getAllPlatforms(): PlatformConfig[] {
  return Object.values(platformConfigs)
}

export function getPlatformsByPostingCapability(capability: 'auto' | 'manual' | 'organize-only'): PlatformConfig[] {
  return Object.values(platformConfigs).filter(platform => 
    platform.postingCapability === capability
  )
}

export function getPlatformsByContentType(contentType: ContentType): PlatformConfig[] {
  return Object.values(platformConfigs).filter(platform => 
    platform.supportedTypes.includes(contentType)
  )
}

export function getPlatformsWithFeature(feature: PlatformFeature): PlatformConfig[] {
  return Object.values(platformConfigs).filter(platform => 
    platform.features.includes(feature)
  )
}

// Validate content against platform requirements
export function validateContentForPlatform(
  platformId: string, 
  contentType: ContentType, 
  file?: File,
  caption?: string
): { valid: boolean; errors: string[] } {
  const platform = getPlatformConfig(platformId)
  if (!platform) {
    return { valid: false, errors: ['Invalid platform'] }
  }

  if (!platform.supportedTypes.includes(contentType)) {
    return { valid: false, errors: [`${platform.displayName} does not support ${contentType} content`] }
  }

  const requirements = platform.requirements[contentType]
  const errors: string[] = []

  // Validate file requirements
  if (file && requirements) {
    if (requirements.maxFileSize && file.size > requirements.maxFileSize * 1024 * 1024) {
      errors.push(`File size exceeds ${requirements.maxFileSize}MB limit`)
    }

    if (requirements.formats) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      if (!fileExtension || !requirements.formats.includes(fileExtension)) {
        errors.push(`File format not supported. Use: ${requirements.formats.join(', ')}`)
      }
    }
  }

  // Validate caption length
  if (caption && requirements?.maxCharacters && caption.length > requirements.maxCharacters) {
    errors.push(`Caption exceeds ${requirements.maxCharacters} character limit`)
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// Get recommended dimensions for a platform/content type
export function getRecommendedDimensions(platformId: string, contentType: ContentType) {
  const platform = getPlatformConfig(platformId)
  return platform?.requirements[contentType]?.dimensions?.recommended || null
}

// Check if platform supports auto posting
export function canAutoPost(platformId: string): boolean {
  const platform = getPlatformConfig(platformId)
  return platform?.postingCapability === 'auto' || false
}
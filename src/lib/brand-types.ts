export interface SocialAccount {
  platform: 'facebook' | 'instagram' | 'tiktok' | 'pinterest' | 'twitter'
  accountId: string
  accessToken: string
  pageId?: string // For Facebook pages
  username?: string
  isActive: boolean
  lastSync?: Date
}

export interface BrandGuidelines {
  voice: {
    tone: string // e.g., "Friendly and casual", "Professional and authoritative"
    personality: string[] // e.g., ["Helpful", "Enthusiastic", "Informative"]
    doNots: string[] // e.g., ["Don't use slang", "Avoid controversial topics"]
  }
  visual: {
    primaryColors: string[]
    secondaryColors: string[]
    logoUrl?: string
    fontStyle: string
  }
  content: {
    hashtags: string[] // Brand-specific hashtags
    keywords: string[] // SEO keywords
    contentPillars: string[] // Main content themes
    postingSchedule: {
      platform: string
      times: string[] // e.g., ["9:00 AM", "3:00 PM", "7:00 PM"]
      frequency: string // e.g., "daily", "3x per week"
    }[]
  }
  aiPrompt: string // Custom prompt for AI content generation
}

export interface Brand {
  id: string
  name: string
  slug: string // URL-friendly name
  description: string
  logo?: string
  website?: string
  industry: string
  targetAudience: string
  socialAccounts: SocialAccount[]
  guidelines: BrandGuidelines
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  stats?: {
    totalPosts: number
    totalFollowers: number
    avgEngagement: number
    lastPostDate?: Date
  }
}

export interface BrandContext {
  currentBrand: Brand | null
  allBrands: Brand[]
  switchBrand: (brandId: string) => void
  updateBrand: (brand: Partial<Brand>) => void
}
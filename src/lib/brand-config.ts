export interface BrandConfig {
  id: string
  name: string
  slug: string
  description: string
  bucket: string
  theme: {
    primary: string
    secondary: string
    accent?: string
  }
  socialTokens: {
    facebook?: string
    instagram?: string
    twitter?: string
    tiktok?: string
    youtube?: string
  }
  aiSettings: {
    voice: string
    personality: string[]
    systemPrompt: string
  }
  industry: string
  targetAudience: string
}

// Brand configurations - add new brands here
export const brandConfigs: Record<string, BrandConfig> = {
  'daily-dish-dash': {
    id: 'daily-dish-dash',
    name: 'Daily Dish Dash',
    slug: 'daily-dish-dash',
    description: 'Quick, delicious recipes and food inspiration for busy people',
    bucket: process.env.DAILY_DISH_R2_BUCKET || 'dailydishdash',
    theme: {
      primary: '#FF6B6B',
      secondary: '#4ECDC4',
      accent: '#45B7D1'
    },
    socialTokens: {
      facebook: process.env.DAILY_DISH_FACEBOOK_PAGE_ACCESS_TOKEN,
      instagram: process.env.DAILY_DISH_INSTAGRAM_ACCESS_TOKEN
    },
    aiSettings: {
      voice: 'Friendly, helpful, and enthusiastic about food. Encouraging and approachable.',
      personality: ['Approachable', 'Encouraging', 'Practical', 'Food-passionate'],
      systemPrompt: `You are an expert recipe creator and food content writer for Daily Dish Dash - focusing on QUICK, EASY recipes for busy people.

Brand Focus: Quick recipes (15-30 minutes max), accessible ingredients, simple techniques
Target Audience: Busy professionals and home cooks looking for quick, tasty meal solutions`
    },
    industry: 'Food & Cooking',
    targetAudience: 'Busy professionals and home cooks looking for quick, tasty meal solutions'
  },

  'grit-collective': {
    id: 'grit-collective',
    name: 'Grit Collective Co.',
    slug: 'grit-collective',
    description: 'Handmade products that inspire and motivate, setting moods and sparking moments',
    bucket: process.env.GRIT_COLLECTIVE_R2_BUCKET || 'grit-collective',
    theme: {
      primary: '#2D3748',
      secondary: '#E2E8F0',
      accent: '#F7FAFC'
    },
    socialTokens: {
      facebook: process.env.GRIT_COLLECTIVE_FACEBOOK_TOKEN,
      instagram: process.env.GRIT_COLLECTIVE_INSTAGRAM_TOKEN
    },
    aiSettings: {
      voice: 'Inspirational, authentic, encouraging with a slightly edgy vibe',
      personality: ['Inspirational', 'Authentic', 'Motivating', 'Edgy'],
      systemPrompt: `You are a content creator for Grit Collective Co. - creating inspirational content about handmade decor and motivation.

Brand Focus: Handcrafted home decor, motivational products, setting moods, sparking moments
Target Audience: Design-conscious consumers seeking motivation and aesthetic home decor`
    },
    industry: 'Home Decor & Lifestyle',
    targetAudience: 'Design-conscious consumers seeking motivation and aesthetic home decor'
  }
}

// Helper functions
export function getBrandConfig(brandSlug: string): BrandConfig | null {
  return brandConfigs[brandSlug] || null
}

export function getAllBrands(): BrandConfig[] {
  return Object.values(brandConfigs)
}

export function getBrandByName(name: string): BrandConfig | null {
  return Object.values(brandConfigs).find(brand => brand.name === name) || null
}

export function isValidBrandSlug(slug: string): boolean {
  return slug in brandConfigs
}

// Get brand's R2 bucket name
export function getBrandBucket(brandSlug: string): string {
  const brand = getBrandConfig(brandSlug)
  return brand?.bucket || 'cheetah-content-media'
}

// Get brand's social token
export function getBrandSocialToken(brandSlug: string, platform: string): string | undefined {
  const brand = getBrandConfig(brandSlug)
  return brand?.socialTokens[platform as keyof typeof brand.socialTokens]
}
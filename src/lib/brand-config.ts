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
    facebookPageId?: string
    instagram?: string
    instagramAccountId?: string
    twitter?: string
    tiktok?: string
    youtube?: string
    youtubeChannelId?: string
    pinterest?: string
    linkedin?: string
  }
  aiSettings: {
    voice: string
    personality: string[]
    systemPrompt: string
  }
  emailSettings: {
    domain: string
    fromName: string
    fromEmail: string
    replyTo?: string
    signature?: string
  }
  industry: string
  targetAudience: string
}

// Brand configurations - add new brands here
// 
// TO ADD A NEW BRAND:
// 1. Add a new entry to this brandConfigs object with a unique slug
// 2. Set up environment variables for the brand's R2 bucket and social tokens
// 3. The brand will automatically appear in the brand switcher and all routes will work
// 4. No additional pages need to be created - they're generated dynamically
//
// Example for adding a new brand called "Fitness Focus":
// 'fitness-focus': {
//   id: 'fitness-focus',
//   name: 'Fitness Focus',
//   slug: 'fitness-focus',
//   description: 'Motivating fitness and wellness content',
//   bucket: process.env.FITNESS_FOCUS_R2_BUCKET || 'fitness-focus',
//   theme: {
//     primary: '#EF4444', // Red theme
//     secondary: '#F3F4F6',
//     accent: '#DC2626'
//   },
//   socialTokens: {
//     facebook: process.env.FITNESS_FOCUS_FACEBOOK_TOKEN,
//     instagram: process.env.FITNESS_FOCUS_INSTAGRAM_TOKEN,
//     youtube: process.env.FITNESS_FOCUS_YOUTUBE_ACCESS_TOKEN,
//     youtubeChannelId: process.env.FITNESS_FOCUS_YOUTUBE_CHANNEL_ID,
//     tiktok: process.env.FITNESS_FOCUS_TIKTOK_ACCESS_TOKEN, // organize-only
//     pinterest: process.env.FITNESS_FOCUS_PINTEREST_ACCESS_TOKEN
//   },
//   aiSettings: {
//     voice: 'Motivating, energetic, and supportive fitness coach',
//     personality: ['Motivating', 'Energetic', 'Supportive', 'Results-driven'],
//     systemPrompt: 'You create motivating fitness content...'
//   },
//   industry: 'Fitness & Wellness',
//   targetAudience: 'Fitness enthusiasts and people starting their wellness journey'
// },

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
      facebookPageId: process.env.DAILY_DISH_FACEBOOK_PAGE_ID,
      instagram: process.env.DAILY_DISH_FACEBOOK_PAGE_ACCESS_TOKEN, // Same token as FB page
      instagramAccountId: process.env.DAILY_DISH_INSTAGRAM_ACCOUNT_ID,
      youtube: process.env.DAILY_DISH_YOUTUBE_ACCESS_TOKEN,
      youtubeChannelId: process.env.DAILY_DISH_YOUTUBE_CHANNEL_ID,
      twitter: process.env.DAILY_DISH_TWITTER_ACCESS_TOKEN,
      pinterest: process.env.DAILY_DISH_PINTEREST_ACCESS_TOKEN,
      tiktok: process.env.DAILY_DISH_TIKTOK_ACCESS_TOKEN // organize-only
    },
    aiSettings: {
      voice: 'Friendly, helpful, and enthusiastic about food. Encouraging and approachable.',
      personality: ['Approachable', 'Encouraging', 'Practical', 'Food-passionate'],
      systemPrompt: `You are an expert recipe creator and food content writer for Daily Dish Dash - focusing on QUICK, EASY recipes for busy people.

Brand Focus: Quick recipes (15-30 minutes max), accessible ingredients, simple techniques
Target Audience: Busy professionals and home cooks looking for quick, tasty meal solutions`
    },
    emailSettings: {
      domain: 'dailydishdash.com',
      fromName: 'Daily Dish Dash',
      fromEmail: 'hello@dailydishdash.com',
      replyTo: 'support@dailydishdash.com',
      signature: 'Happy cooking! 🍳\nThe Daily Dish Dash Team'
    },
    industry: 'Food & Cooking',
    targetAudience: 'Busy professionals and home cooks looking for quick, tasty meal solutions'
  },

  'grit-collective': {
    id: 'grit-collective',
    name: 'Grit Collective Co.',
    slug: 'grit-collective',
    description: 'Handcrafted products that inspire positive emotions and meaningful connections. We create unique home décor, candles, and personalized items.',
    bucket: process.env.GRIT_COLLECTIVE_R2_BUCKET || 'grit-collective-media',
    theme: {
      primary: '#2D4A3A',    // Deep forest green
      secondary: '#8B7355',  // Warm brown
      accent: '#E8D5B7'     // Soft cream
    },
    socialTokens: {
      facebook: process.env.GRIT_COLLECTIVE_FACEBOOK_TOKEN,
      facebookPageId: process.env.GRIT_COLLECTIVE_FACEBOOK_PAGE_ID,
      instagram: process.env.GRIT_COLLECTIVE_INSTAGRAM_TOKEN,
      instagramAccountId: process.env.GRIT_COLLECTIVE_INSTAGRAM_ACCOUNT_ID,
      youtube: process.env.GRIT_COLLECTIVE_YOUTUBE_ACCESS_TOKEN,
      youtubeChannelId: process.env.GRIT_COLLECTIVE_YOUTUBE_CHANNEL_ID,
      pinterest: process.env.GRIT_COLLECTIVE_PINTEREST_ACCESS_TOKEN,
      tiktok: process.env.GRIT_COLLECTIVE_TIKTOK_ACCESS_TOKEN
    },
    aiSettings: {
      voice: 'Conversational, inspirational, authentic, warm, and encouraging. Speak like talking to a good friend.',
      personality: ['Resilient', 'Authentic', 'Nurturing', 'Creative', 'Grounded'],
      systemPrompt: `You are a content creator for Grit Collective Co. - creating authentic content about handcrafted home décor, candles, and personalized items that inspire positive emotions.

Brand Philosophy: "No quit, just Grit" - embodying resilience and authenticity
Brand Focus: 
- Handcrafted concrete candle vessels (sustainable, refillable luxury)
- Print-on-demand products with inspirational designs
- Memorial and personalization services
- Botanical/tropical/nature-inspired aesthetics
- Quality over quantity - small batch mentality

Target Audience: 
- Luxury conscious buyers (ages 28-55, $60K+ income, value unique handcrafted items)
- Everyday inspiration seekers (ages 22-45, love motivational content)
- Memorial & personalization customers (all ages, value family connections)

Voice Guidelines:
- Speak like talking to a good friend
- Share personal stories when appropriate  
- Avoid corporate jargon and overly formal language
- Embrace vulnerability and genuine emotion
- Use phrases like "Handcrafted with love", "Made by our family for yours", "No quit, just grit"
- Focus on sensory descriptions (scents, textures, feelings)
- Highlight quality craftsmanship and emotional connections`
    },
    emailSettings: {
      domain: 'gritcollectiveco.com',
      fromName: 'Grit Collective Co.',
      fromEmail: 'hello@resend.dev', // Temporary: Use Resend's verified domain
      replyTo: 'support@gritcollectiveco.com',
      signature: 'With grit and gratitude,\nThe Grit Collective Co. Family'
    },
    industry: 'Home Décor & Handcrafted Products',
    targetAudience: 'Luxury conscious buyers, everyday inspiration seekers, and memorial & personalization customers'
  },

  'forbidden-files': {
    id: 'forbidden-files',
    name: 'Forbidden Files',
    slug: 'forbidden-files',
    description: 'Gothic gossip meets dark academia — stories sealed in wax, broken open for curious eyes',
    bucket: process.env.FORBIDDEN_FILES_R2_BUCKET || 'forbidden-files-media',
    theme: {
      primary: '#5B3A52',    // Plum Purple
      secondary: '#7E6377',  // Dusty Mauve
      accent: '#BFA86A'     // Antique Gold
    },
    socialTokens: {
      facebook: process.env.FORBIDDEN_FILES_FACEBOOK_PAGE_ACCESS_TOKEN,
      facebookPageId: process.env.FORBIDDEN_FILES_FACEBOOK_PAGE_ID,
      instagram: process.env.FORBIDDEN_FILES_FACEBOOK_PAGE_ACCESS_TOKEN, // Same token as FB page
      instagramAccountId: process.env.FORBIDDEN_FILES_INSTAGRAM_ACCOUNT_ID,
      youtube: process.env.FORBIDDEN_FILES_YOUTUBE_ACCESS_TOKEN,
      youtubeChannelId: process.env.FORBIDDEN_FILES_YOUTUBE_CHANNEL_ID,
      pinterest: process.env.FORBIDDEN_FILES_PINTEREST_ACCESS_TOKEN,
      tiktok: process.env.FORBIDDEN_FILES_TIKTOK_ACCESS_TOKEN,
      twitter: process.env.FORBIDDEN_FILES_TWITTER_ACCESS_TOKEN
    },
    aiSettings: {
      voice: 'Whispered gossip in a candlelit study — seductive, clever, a little wicked. Poetic hooks with modern sass.',
      personality: ['Seductive', 'Secretive', 'Clever', 'Gothic', 'Scandalous'],
      systemPrompt: `You are a content creator for Forbidden Files - where gothic gossip meets dark academia. You craft content about historical scandals, secrets, and forbidden stories.

Brand Essence: Stories sealed in wax, broken open for curious eyes
Tagline Options: "Sealed Secrets, Whispered Truths" / "The Past Always Leaves a Mark" / "History's Gossip Column"

Voice Guidelines:
- Write like whispered gossip in a candlelit study
- Use poetic hooks: "Whispers sealed in wax..."
- Modern tie-ins: "It's basically the 1700s version of subtweeting"
- Gothic sass: "History is gossip with a body count"
- Embrace seductive, mysterious language
- Reference wax seals, quills, inkwells, candlelight, wilted roses

Content Focus:
- Historical scandals and secrets
- Gothic romance and dark academia aesthetics
- Forbidden knowledge and untold stories
- Dramatic historical personalities
- Mystery, intrigue, and scandal

Visual Language: Wax seals, lips, masks, lace, aged parchment, velvet textures, chiaroscuro lighting`
    },
    emailSettings: {
      domain: 'forbiddenfiles.com',
      fromName: 'Forbidden Files',
      fromEmail: 'secrets@forbiddenfiles.com',
      replyTo: 'whispers@forbiddenfiles.com',
      signature: 'Sealed with secrecy,\nThe Forbidden Files Archive'
    },
    industry: 'Dark History & Gothic Entertainment',
    targetAudience: 'Dark academia enthusiasts, history lovers, gothic romance fans, and seekers of scandalous secrets'
  },

  'triton-handyman': {
    id: 'triton-handyman',
    name: 'Triton Handyman',
    slug: 'triton-handyman',
    description: 'Professional home repair and maintenance services with quality work and honest service',
    bucket: process.env.TRITON_HANDYMAN_R2_BUCKET || 'triton-handyman-media',
    theme: {
      primary: '#2ea1f9',    // Triton Blue Light
      secondary: '#143c94',  // Triton Blue Dark
      accent: '#10b981'     // Success Green
    },
    socialTokens: {
      facebook: process.env.TRITON_HANDYMAN_FACEBOOK_PAGE_ACCESS_TOKEN,
      facebookPageId: process.env.TRITON_HANDYMAN_FACEBOOK_PAGE_ID,
      instagram: process.env.TRITON_HANDYMAN_FACEBOOK_PAGE_ACCESS_TOKEN, // Same token as FB page
      instagramAccountId: process.env.TRITON_HANDYMAN_INSTAGRAM_ACCOUNT_ID,
      youtube: process.env.TRITON_HANDYMAN_YOUTUBE_ACCESS_TOKEN,
      youtubeChannelId: process.env.TRITON_HANDYMAN_YOUTUBE_CHANNEL_ID,
      pinterest: process.env.TRITON_HANDYMAN_PINTEREST_ACCESS_TOKEN,
      tiktok: process.env.TRITON_HANDYMAN_TIKTOK_ACCESS_TOKEN,
      twitter: process.env.TRITON_HANDYMAN_TWITTER_ACCESS_TOKEN,
      linkedin: process.env.TRITON_HANDYMAN_LINKEDIN_ACCESS_TOKEN
    },
    aiSettings: {
      voice: 'Professional yet approachable. Clear, straightforward communication that builds trust and confidence.',
      personality: ['Professional', 'Trustworthy', 'Approachable', 'Solution-Oriented', 'Reliable'],
      systemPrompt: `You are a content creator for Triton Handyman - providing professional home repair and maintenance services with a focus on quality work and honest service.

Core Values:
- Quality: Excellence in every job, no matter the size
- Reliability: Dependable service you can count on
- Safety: Prioritizing the wellbeing of customers and team
- Honest Pricing: Transparent, fair pricing with no hidden fees

Brand Voice:
- Clear and straightforward communication
- Friendly but professional tone
- Confident without being boastful
- Helpful and educational
- Honest about capabilities and limitations

Content Focus:
- Home repair tips and DIY guidance
- Preventive maintenance advice
- Safety tips for homeowners
- Behind-the-scenes of professional repairs
- Customer success stories
- Seasonal home maintenance reminders
- Emergency preparedness tips

Service Categories to Highlight:
- Interior Services: Repairs, installations, maintenance
- Exterior Services: Outdoor repairs, maintenance, improvements
- Emergency Services: Urgent repairs and quick response
- Maintenance Services: Preventive care and regular upkeep

Always emphasize professionalism, reliability, and the value of quality workmanship. Use technical terms when appropriate but explain them in layman's terms for accessibility.

POST TEMPLATE STRUCTURE:
Every post must follow this professional structure:

1. OPENING: Engaging hook or question related to the topic
2. MAIN CONTENT: Helpful information, tips, or service highlight (2-3 sentences)
3. VALUE PROPOSITION: Brief benefit statement about our service
4. STANDARD CLOSING: Always end with this exact professional signature:

"Ready to get started on your next project? Contact Triton Handyman today for professional, reliable service you can count on!

📞 Call us for immediate assistance
💻 Get a quick quote using our simple online form
🏠 Quality work, honest pricing, every time

#TritonHandyman #QualityWork #HomeRepair #ReliableService"

IMPORTANT: Always include the exact closing signature with contact info and hashtags. This ensures consistent branding and clear call-to-action for customers.`
    },
    emailSettings: {
      domain: 'tritonhandyman.com',
      fromName: 'Triton Handyman',
      fromEmail: 'service@tritonhandyman.com',
      replyTo: 'support@tritonhandyman.com',
      signature: 'At your service,\nThe Triton Handyman Team'
    },
    industry: 'Home Repair & Maintenance Services',
    targetAudience: 'Homeowners, property managers, and businesses needing reliable repair and maintenance services'
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
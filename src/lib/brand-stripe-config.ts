// Brand-specific Stripe configuration
export interface BrandStripeConfig {
  secretKey: string
  publishableKey: string
  webhookSecret: string
  currency?: string
  statementDescriptor?: string
}

// Get Stripe configuration for a specific brand
export function getBrandStripeConfig(brandSlug: string): BrandStripeConfig | null {
  switch (brandSlug) {
    case 'grit-collective':
      return {
        secretKey: process.env.GRIT_COLLECTIVE_STRIPE_SECRET_KEY || '',
        publishableKey: process.env.GRIT_COLLECTIVE_STRIPE_PUBLISHABLE_KEY || '',
        webhookSecret: process.env.GRIT_COLLECTIVE_STRIPE_WEBHOOK_SECRET || '',
        currency: 'usd',
        statementDescriptor: 'GRIT COLLECTIVE'
      }
    
    case 'daily-dish-dash':
      return {
        secretKey: process.env.DAILY_DISH_STRIPE_SECRET_KEY || '',
        publishableKey: process.env.DAILY_DISH_STRIPE_PUBLISHABLE_KEY || '',
        webhookSecret: process.env.DAILY_DISH_STRIPE_WEBHOOK_SECRET || '',
        currency: 'usd',
        statementDescriptor: 'DAILY DISH'
      }
    
    default:
      // Fallback to generic Stripe keys if available
      if (process.env.STRIPE_SECRET_KEY) {
        return {
          secretKey: process.env.STRIPE_SECRET_KEY || '',
          publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
          webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
          currency: 'usd',
          statementDescriptor: 'CHEETAH CMS'
        }
      }
      return null
  }
}

// Validate if Stripe is configured for a brand
export function isStripeConfigured(brandSlug: string): boolean {
  const config = getBrandStripeConfig(brandSlug)
  return !!(config?.secretKey && config?.publishableKey)
}
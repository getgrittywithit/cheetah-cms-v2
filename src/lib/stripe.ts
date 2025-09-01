import Stripe from 'stripe'
import { getBrandStripeConfig } from './brand-stripe-config'

// Cache Stripe instances per brand to avoid recreating them
const stripeInstances: Record<string, Stripe> = {}

export function getStripeInstance(brandSlug: string): Stripe | null {
  // Return cached instance if it exists
  if (stripeInstances[brandSlug]) {
    return stripeInstances[brandSlug]
  }

  const config = getBrandStripeConfig(brandSlug)
  if (!config?.secretKey) {
    console.error(`Stripe not configured for brand: ${brandSlug}`)
    return null
  }

  try {
    // Create new Stripe instance
    const stripe = new Stripe(config.secretKey, {
      apiVersion: '2024-12-18.acacia',
      typescript: true,
    })

    // Cache the instance
    stripeInstances[brandSlug] = stripe
    return stripe
  } catch (error) {
    console.error(`Failed to initialize Stripe for ${brandSlug}:`, error)
    return null
  }
}

// Helper function to get publishable key for client-side
export function getStripePublishableKey(brandSlug: string): string | null {
  const config = getBrandStripeConfig(brandSlug)
  return config?.publishableKey || null
}

// Helper to format prices for Stripe (convert to cents)
export function formatPriceForStripe(price: number): number {
  return Math.round(price * 100)
}

// Helper to format prices for display (convert from cents)
export function formatPriceForDisplay(priceInCents: number): number {
  return priceInCents / 100
}

// Helper to get currency symbol
export function getCurrencySymbol(currency: string = 'usd'): string {
  const symbols: Record<string, string> = {
    usd: '$',
    eur: '€',
    gbp: '£',
    cad: 'C$',
  }
  return symbols[currency.toLowerCase()] || currency.toUpperCase()
}
import { supabaseAdmin } from '@/lib/supabase'

export interface BrandLookup {
  id: string
  name: string
  slug: string
}

/**
 * Utility functions for brand management using database as source of truth
 */

/**
 * Convert brand slug to UUID by looking up in database
 */
export async function getBrandIdBySlug(slug: string): Promise<string | null> {
  try {
    const { data: brand, error } = await supabaseAdmin
      .from('brand_profiles')
      .select('id')
      .eq('slug', slug)
      .single()
    
    if (error) {
      console.error('Error looking up brand by slug:', error)
      return null
    }
    
    return brand?.id || null
  } catch (error) {
    console.error('Database error during brand lookup:', error)
    return null
  }
}

/**
 * Get complete brand information by slug
 */
export async function getBrandBySlug(slug: string): Promise<BrandLookup | null> {
  try {
    const { data: brand, error } = await supabaseAdmin
      .from('brand_profiles')
      .select('id, name, slug')
      .eq('slug', slug)
      .single()
    
    if (error) {
      console.error('Error getting brand by slug:', error)
      return null
    }
    
    return brand
  } catch (error) {
    console.error('Database error during brand lookup:', error)
    return null
  }
}

/**
 * Get complete brand information by UUID
 */
export async function getBrandById(id: string): Promise<BrandLookup | null> {
  try {
    const { data: brand, error } = await supabaseAdmin
      .from('brand_profiles')
      .select('id, name, slug')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error getting brand by ID:', error)
      return null
    }
    
    return brand
  } catch (error) {
    console.error('Database error during brand lookup:', error)
    return null
  }
}

/**
 * List all active brands
 */
export async function getAllBrands(): Promise<BrandLookup[]> {
  try {
    const { data: brands, error } = await supabaseAdmin
      .from('brand_profiles')
      .select('id, name, slug')
      .order('name')
    
    if (error) {
      console.error('Error getting all brands:', error)
      return []
    }
    
    return brands || []
  } catch (error) {
    console.error('Database error getting all brands:', error)
    return []
  }
}

/**
 * Validate if a brand slug exists
 */
export async function brandSlugExists(slug: string): Promise<boolean> {
  const brand = await getBrandBySlug(slug)
  return brand !== null
}

/**
 * Generate URL-friendly slug from brand name
 */
export function generateBrandSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}
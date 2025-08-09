import { NextResponse } from 'next/server'
import { Brand } from '@/lib/brand-types'
import { supabase } from '@/lib/supabase'

// Helper to transform database brands to the Brand interface
function transformBrand(dbBrand: Record<string, unknown>): Brand {
  return {
    id: dbBrand.id,
    name: dbBrand.name,
    slug: dbBrand.name.toLowerCase().replace(/\s+/g, '-'),
    description: dbBrand.description || '',
    website: dbBrand.tagline || '',
    industry: dbBrand.industry || '',
    targetAudience: dbBrand.target_audience || '',
    socialAccounts: (dbBrand.social_accounts as Record<string, unknown>[] | null)?.map((acc) => ({
      platform: acc.platform,
      accountId: acc.account_id || '',
      accessToken: acc.access_token || '',
      pageId: acc.account_id || '',
      username: acc.account_handle || '',
      isActive: acc.is_active || false
    })) || [],
    guidelines: {
      voice: {
        tone: dbBrand.tone_of_voice || '',
        personality: dbBrand.brand_personality || [],
        doNots: []
      },
      visual: {
        primaryColors: [dbBrand.primary_color || '#000000', dbBrand.secondary_color || '#FFFFFF'].filter(Boolean),
        secondaryColors: [dbBrand.accent_color].filter(Boolean),
        fontStyle: `${dbBrand.primary_font || 'Sans-serif'}, ${dbBrand.secondary_font || 'serif'}`
      },
      content: {
        hashtags: [],
        keywords: dbBrand.brand_values || [],
        contentPillars: [],
        postingSchedule: []
      },
      aiPrompt: dbBrand.unique_value_proposition || ''
    },
    isActive: true,
    createdAt: new Date(dbBrand.created_at),
    updatedAt: new Date(dbBrand.updated_at)
  }
}

export async function GET() {
  try {
    // For now, use a hardcoded user ID (replace with proper auth later)
    const userId = 'temp-user-id'
    
    // Fetch brands with their social accounts from Supabase
    const { data: dbBrands, error } = await supabase
      .from('brand_profiles')
      .select(`
        *,
        social_accounts (*)
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      throw error
    }
    
    // If no brands exist, create default ones
    if (!dbBrands || dbBrands.length === 0) {
      // Create default brands in database
      const defaultBrands = [
        {
          user_id: userId,
          name: 'Daily Dish Dash',
          description: 'Quick, delicious recipes and food inspiration for busy people',
          industry: 'Food & Cooking',
          target_audience: 'Busy professionals and home cooks looking for quick, tasty meal solutions',
          tone_of_voice: 'Friendly, helpful, and enthusiastic about food',
          brand_personality: ['Approachable', 'Encouraging', 'Practical', 'Food-passionate'],
          primary_color: '#FF6B6B',
          secondary_color: '#4ECDC4',
          is_default: true
        }
      ]
      
      const { data: createdBrands, error: createError } = await supabase
        .from('brand_profiles')
        .insert(defaultBrands)
        .select(`
          *,
          social_accounts (*)
        `)
      
      if (createError) {
        console.error('Failed to create default brands:', createError)
      } else if (createdBrands) {
        // Create social accounts for the new brand
        const brandId = createdBrands[0].id
        const socialAccounts = [
          {
            user_id: userId,
            brand_profile_id: brandId,
            platform: 'facebook',
            account_handle: 'dailydishdash',
            access_token: process.env.DAILY_DISH_FACEBOOK_PAGE_ACCESS_TOKEN || '',
            account_id: process.env.DAILY_DISH_FACEBOOK_PAGE_ID || '',
            is_active: !!process.env.DAILY_DISH_FACEBOOK_PAGE_ACCESS_TOKEN,
            posting_enabled: !!process.env.DAILY_DISH_FACEBOOK_PAGE_ACCESS_TOKEN
          },
          {
            user_id: userId,
            brand_profile_id: brandId,
            platform: 'instagram',
            account_handle: 'dailydishdash',
            access_token: process.env.DAILY_DISH_INSTAGRAM_ACCESS_TOKEN || '',
            is_active: !!process.env.DAILY_DISH_INSTAGRAM_ACCESS_TOKEN,
            posting_enabled: !!process.env.DAILY_DISH_INSTAGRAM_ACCESS_TOKEN
          }
        ]
        
        await supabase
          .from('social_accounts')
          .insert(socialAccounts)
      }
      
      // Fetch again with social accounts
      const { data: newBrands } = await supabase
        .from('brand_profiles')
        .select(`
          *,
          social_accounts (*)
        `)
        .order('created_at', { ascending: false })
      
      const brands = (newBrands || []).map(transformBrand)
      
      return NextResponse.json({
        success: true,
        brands
      })
    }
    
    // Transform database brands to match Brand interface
    const brands = dbBrands.map(transformBrand)
    
    return NextResponse.json({
      success: true,
      brands
    })
  } catch (error) {
    console.error('Failed to get brands:', error)
    return NextResponse.json(
      { error: 'Failed to get brands' },
      { status: 500 }
    )
  }
}
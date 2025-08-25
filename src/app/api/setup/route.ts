import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST() {
  try {
    // Use a static UUID for now since we don't have proper auth
    // In production, this would be the authenticated user's ID
    const userId = '00000000-0000-0000-0000-000000000000'

    // First, ensure a user profile exists (for foreign key constraint)
    try {
      await supabaseAdmin
        .from('profiles')
        .upsert({
          id: userId,
          email: 'admin@cheetah.com'
        })
    } catch (profileError) {
      console.log('Profiles table might not exist or already has the user:', profileError)
    }

    // Check if brands already exist
    const { data: existingBrands, error: checkError } = await supabaseAdmin
      .from('brand_profiles')
      .select('id')
      .limit(1)
    
    if (checkError) {
      console.error('Error checking existing brands:', checkError)
      throw checkError
    }

    if (existingBrands && existingBrands.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Brands already exist'
      })
    }

    // Create Daily Dish Dash brand
    const { data: dailyDishBrand, error: dailyDishError } = await supabaseAdmin
      .from('brand_profiles')
      .insert({
        user_id: userId,
        name: 'Daily Dish Dash',
        description: 'Quick, delicious recipes and food inspiration for busy people',
        industry: 'Food & Cooking',
        target_audience: 'Busy professionals and home cooks looking for quick, tasty meal solutions',
        tone_of_voice: 'Friendly, helpful, and enthusiastic about food',
        brand_personality: ['Approachable', 'Encouraging', 'Practical', 'Food-passionate'],
        primary_color: '#FF6B6B',
        secondary_color: '#4ECDC4',
        tagline: 'Quick meals made simple',
        unique_value_proposition: 'Create content for Daily Dish Dash, focusing on quick, delicious, and accessible recipes for busy people'
      })
      .select()
      .single()

    if (dailyDishError) {
      console.error('Error creating Daily Dish Dash:', dailyDishError)
      throw dailyDishError
    }

    // Create Grit Collective brand
    const { data: gritBrand, error: gritError } = await supabaseAdmin
      .from('brand_profiles')
      .insert({
        user_id: userId,
        name: 'Grit Collective Co.',
        description: 'Curated lifestyle products that inspire and elevate everyday moments',
        industry: 'Home Decor & Lifestyle',
        target_audience: 'Design-conscious consumers seeking motivation and aesthetic home decor',
        tone_of_voice: 'Inspirational, authentic, encouraging with a slightly edgy vibe',
        brand_personality: ['Encouraging', 'Authentic', 'Creative', 'Slightly rebellious', 'Motivational'],
        primary_color: '#6B7B4A',
        secondary_color: '#8B6F47',
        accent_color: '#F4F1E8',
        tagline: 'Set the Mood, Spark the Moment',
        unique_value_proposition: 'Create content for Grit Collective Co., a lifestyle brand focused on handmade home decor and motivational products. Use an inspirational but authentic tone with slight edge. Focus on how products spark moments and set moods in everyday life.'
      })
      .select()
      .single()

    if (gritError) {
      console.error('Error creating Grit Collective:', gritError)
      throw gritError
    }

    // Create social accounts for Daily Dish Dash
    const dailyDishSocials = [
      {
        user_id: userId,
        brand_profile_id: dailyDishBrand.id,
        platform: 'facebook',
        account_handle: 'dailydishdash',
        access_token: process.env.DAILY_DISH_FACEBOOK_PAGE_ACCESS_TOKEN || '',
        account_id: process.env.DAILY_DISH_FACEBOOK_PAGE_ID || '',
        is_active: !!process.env.DAILY_DISH_FACEBOOK_PAGE_ACCESS_TOKEN,
        posting_enabled: !!process.env.DAILY_DISH_FACEBOOK_PAGE_ACCESS_TOKEN
      },
      {
        user_id: userId,
        brand_profile_id: dailyDishBrand.id,
        platform: 'instagram',
        account_handle: 'dailydishdash',
        access_token: process.env.DAILY_DISH_INSTAGRAM_ACCESS_TOKEN || '',
        account_id: 'dailydishdash',
        is_active: !!process.env.DAILY_DISH_INSTAGRAM_ACCESS_TOKEN,
        posting_enabled: !!process.env.DAILY_DISH_INSTAGRAM_ACCESS_TOKEN
      }
    ]

    const { error: dailySocialError } = await supabaseAdmin
      .from('social_accounts')
      .insert(dailyDishSocials)

    if (dailySocialError) {
      console.error('Error creating Daily Dish social accounts:', dailySocialError)
    }

    // Create social accounts for Grit Collective
    const gritSocials = [
      {
        user_id: userId,
        brand_profile_id: gritBrand.id,
        platform: 'facebook',
        account_handle: 'gritcollectiveco',
        access_token: process.env.GRIT_FACEBOOK_PAGE_ACCESS_TOKEN || '',
        account_id: process.env.GRIT_FACEBOOK_PAGE_ID || '',
        is_active: !!process.env.GRIT_FACEBOOK_PAGE_ACCESS_TOKEN,
        posting_enabled: !!process.env.GRIT_FACEBOOK_PAGE_ACCESS_TOKEN
      },
      {
        user_id: userId,
        brand_profile_id: gritBrand.id,
        platform: 'instagram',
        account_handle: 'gritcollectiveco',
        access_token: process.env.GRIT_INSTAGRAM_ACCESS_TOKEN || '',
        account_id: 'gritcollectiveco',
        is_active: !!process.env.GRIT_INSTAGRAM_ACCESS_TOKEN,
        posting_enabled: !!process.env.GRIT_INSTAGRAM_ACCESS_TOKEN
      },
      {
        user_id: userId,
        brand_profile_id: gritBrand.id,
        platform: 'tiktok',
        account_handle: 'gritcollectiveco',
        access_token: '',
        account_id: 'gritcollectiveco',
        is_active: false, // Manual posting
        posting_enabled: false
      },
      {
        user_id: userId,
        brand_profile_id: gritBrand.id,
        platform: 'youtube',
        account_handle: 'gritcollectiveco',
        access_token: '',
        account_id: 'gritcollectiveco',
        is_active: false, // Manual posting
        posting_enabled: false
      }
    ]

    const { error: gritSocialError } = await supabaseAdmin
      .from('social_accounts')
      .insert(gritSocials)

    if (gritSocialError) {
      console.error('Error creating Grit Collective social accounts:', gritSocialError)
    }

    return NextResponse.json({
      success: true,
      message: 'Brands and social accounts created successfully',
      brands: [
        { id: dailyDishBrand.id, name: 'Daily Dish Dash' },
        { id: gritBrand.id, name: 'Grit Collective Co.' }
      ]
    })

  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to setup brands',
        details: error instanceof Error ? error.message : 'Unknown error',
        fullError: error
      },
      { status: 500 }
    )
  }
}
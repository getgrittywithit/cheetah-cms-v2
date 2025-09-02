import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getBrandConfig } from '@/lib/brand-config'

// GET all eBay listings for a brand
export async function GET(
  request: NextRequest,
  { params }: { params: { brand: string } }
) {
  try {
    const brandConfig = getBrandConfig(params.brand)
    if (!brandConfig || params.brand !== 'grit-collective') {
      return NextResponse.json({ success: false, error: 'eBay feature only available for Grit Collective' }, { status: 404 })
    }

    // Get brand profile
    const { data: brandProfile } = await supabaseAdmin
      .from('brand_profiles')
      .select('id')
      .eq('slug', params.brand)
      .single()

    if (!brandProfile) {
      return NextResponse.json({ success: false, error: 'Brand not found' }, { status: 404 })
    }

    // Get all eBay listings
    const { data: listings, error } = await supabaseAdmin
      .from('ebay_listings')
      .select('*')
      .eq('brand_profile_id', brandProfile.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching eBay listings:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch listings' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      listings: listings || []
    })
  } catch (error) {
    console.error('Error fetching eBay listings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch listings' },
      { status: 500 }
    )
  }
}

// POST create new eBay listing
export async function POST(
  request: NextRequest,
  { params }: { params: { brand: string } }
) {
  try {
    const brandConfig = getBrandConfig(params.brand)
    if (!brandConfig || params.brand !== 'grit-collective') {
      return NextResponse.json({ success: false, error: 'eBay feature only available for Grit Collective' }, { status: 404 })
    }

    const body = await request.json()
    const { title, description, price, category, keywords, condition, status, ebay_url } = body

    // Get brand profile
    const { data: brandProfile } = await supabaseAdmin
      .from('brand_profiles')
      .select('id')
      .eq('slug', params.brand)
      .single()

    if (!brandProfile) {
      return NextResponse.json({ success: false, error: 'Brand not found' }, { status: 404 })
    }

    // Create eBay listing
    const { data: listing, error } = await supabaseAdmin
      .from('ebay_listings')
      .insert({
        brand_profile_id: brandProfile.id,
        title,
        description,
        price: parseFloat(price),
        category,
        keywords: keywords || [],
        condition: condition || 'Used',
        status: status || 'draft',
        ebay_url,
        views: 0,
        watchers: 0
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating eBay listing:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create listing',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      listing 
    })
  } catch (error) {
    console.error('Error creating eBay listing:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create listing' },
      { status: 500 }
    )
  }
}
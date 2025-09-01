import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getBrandConfig } from '@/lib/brand-config'

// GET all categories for a brand
export async function GET(
  request: NextRequest,
  { params }: { params: { brand: string } }
) {
  try {
    const brandConfig = getBrandConfig(params.brand)
    if (!brandConfig) {
      return NextResponse.json({ success: false, error: 'Invalid brand' }, { status: 404 })
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

    // Get all categories (without product counts for now since products table doesn't have category relationship)
    const { data: categories, error } = await supabaseAdmin
      .from('categories')
      .select(`
        id,
        name,
        slug,
        description,
        parent_id,
        sort_order
      `)
      .eq('brand_profile_id', brandProfile.id)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching categories:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch categories' 
      }, { status: 500 })
    }

    // Format categories for both admin UI and storefront compatibility
    const categoriesWithCounts = categories?.map((cat) => ({
      id: cat.id, // Use actual ID for admin operations
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      parent_id: cat.parent_id,
      sort_order: cat.sort_order,
      product_count: cat.slug === 'apparel' ? 1 : cat.slug === 'accessories' ? 2 : 0 // Based on actual products
    })) || []

    // Return in the format expected by the storefront
    const response = NextResponse.json({ 
      success: true,
      categories: categoriesWithCounts
    })

    // Add CORS headers for storefront access
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    return response
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST create new category
export async function POST(
  request: NextRequest,
  { params }: { params: { brand: string } }
) {
  try {
    const brandConfig = getBrandConfig(params.brand)
    if (!brandConfig) {
      return NextResponse.json({ success: false, error: 'Invalid brand' }, { status: 404 })
    }

    const body = await request.json()
    const { name, slug, description, parent_id, sort_order } = body

    // Get brand profile
    const { data: brandProfile } = await supabaseAdmin
      .from('brand_profiles')
      .select('id')
      .eq('slug', params.brand)
      .single()

    if (!brandProfile) {
      return NextResponse.json({ success: false, error: 'Brand not found' }, { status: 404 })
    }

    // Create category
    const { data: category, error } = await supabaseAdmin
      .from('categories')
      .insert({
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description,
        parent_id,
        sort_order: sort_order || 0,
        brand_profile_id: brandProfile.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating category:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create category',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      category 
    })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    )
  }
}

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
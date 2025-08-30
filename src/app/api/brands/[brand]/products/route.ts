import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getBrandConfig, isValidBrandSlug } from '@/lib/brand-config'
import { ProductInsert } from '@/types/product'

// GET /api/brands/[brand]/products - Get products for specific brand
export async function GET(
  request: NextRequest,
  { params }: { params: { brand: string } }
) {
  try {
    // Validate brand slug
    if (!isValidBrandSlug(params.brand)) {
      return NextResponse.json({ error: 'Invalid brand' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0
    const search = searchParams.get('search')

    // Get brand configuration
    const brandConfig = getBrandConfig(params.brand)
    if (!brandConfig) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    let query = supabaseAdmin
      .from('products')
      .select(`
        *,
        product_variants(*)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filter by brand - for now we'll use the brand slug in a tag or use brand_profile_id
    // This assumes you have brand profiles in database, otherwise we filter by tags
    if (status) {
      query = query.eq('status', status)
    }

    // Add search functionality
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{${search}}`)
    }

    // For now, filter by brand using tags until brand_profile_id mapping is set up
    query = query.contains('tags', [params.brand])

    const { data: products, error, count } = await query

    if (error) {
      console.error('Error fetching brand products:', error)
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }

    // Calculate stats
    const stats = {
      total: products?.length || 0,
      active: products?.filter(p => p.status === 'active').length || 0,
      draft: products?.filter(p => p.status === 'draft').length || 0,
      archived: products?.filter(p => p.status === 'archived').length || 0,
      low_stock: products?.filter(p => p.track_inventory && (p.quantity || 0) < 10).length || 0
    }

    return NextResponse.json({ 
      products: products || [],
      stats,
      brand: brandConfig,
      success: true 
    })

  } catch (error) {
    console.error('Error in brand products GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/brands/[brand]/products - Create product for specific brand
export async function POST(
  request: NextRequest,
  { params }: { params: { brand: string } }
) {
  try {
    // Validate brand slug
    if (!isValidBrandSlug(params.brand)) {
      return NextResponse.json({ error: 'Invalid brand' }, { status: 400 })
    }

    const brandConfig = getBrandConfig(params.brand)
    if (!brandConfig) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      name,
      description,
      short_description,
      price,
      compare_at_price,
      cost_per_item,
      sku,
      track_inventory = true,
      quantity,
      weight,
      weight_unit = 'lb',
      requires_shipping = true,
      is_physical = true,
      status = 'draft',
      visibility = 'visible',
      product_type,
      vendor,
      tags = [],
      images = [],
      featured_image,
      seo_title,
      seo_description
    } = body

    // Ensure brand tag is included
    const brandTags = [...new Set([...tags, params.brand])]

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Create the product with brand association
    const productData: ProductInsert = {
      user_id: '00000000-0000-0000-0000-000000000000', // Will be replaced with actual user ID from auth
      brand_profile_id: params.brand, // Using brand slug for now
      name,
      description,
      short_description,
      slug,
      sku,
      price,
      compare_at_price,
      cost_per_item,
      track_inventory,
      continue_selling_when_out_of_stock: !track_inventory,
      quantity,
      weight,
      weight_unit,
      requires_shipping,
      is_physical,
      status,
      visibility,
      product_type,
      vendor: vendor || brandConfig.name,
      tags: brandTags,
      images,
      featured_image,
      seo_title,
      seo_description,
      handle: slug,
      published_at: status === 'active' ? new Date().toISOString() : null
    }

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .insert([productData])
      .select()
      .single()

    if (error) {
      console.error('Error creating brand product:', error)
      return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
    }

    // Create default variant
    const { error: variantError } = await supabaseAdmin
      .from('product_variants')
      .insert([{
        product_id: product.id,
        title: 'Default Title',
        price,
        compare_at_price,
        sku,
        position: 1,
        inventory_policy: track_inventory ? 'deny' : 'continue',
        inventory_management: track_inventory ? 'shopify' : null,
        taxable: true,
        weight,
        weight_unit,
        inventory_quantity: quantity,
        requires_shipping
      }])

    if (variantError) {
      console.error('Error creating product variant:', variantError)
    }

    return NextResponse.json({ 
      product,
      brand: brandConfig,
      success: true 
    })

  } catch (error) {
    console.error('Error in brand products POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
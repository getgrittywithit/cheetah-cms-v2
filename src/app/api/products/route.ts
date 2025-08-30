import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { ProductInsert } from '@/types/product'

// GET /api/products - List products with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brandId = searchParams.get('brand_id')
    const status = searchParams.get('status')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0

    let query = supabaseAdmin
      .from('products')
      .select(`
        *,
        product_variants(*)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (brandId) {
      query = query.eq('brand_profile_id', brandId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: products, error } = await query

    if (error) {
      console.error('Error fetching products:', error)
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }

    return NextResponse.json({ 
      products,
      success: true 
    })

  } catch (error) {
    console.error('Error in products GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      brand_profile_id,
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

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Create the product
    const productData: ProductInsert = {
      user_id: '00000000-0000-0000-0000-000000000000', // Will be replaced with actual user ID from auth
      brand_profile_id,
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
      vendor,
      tags,
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
      console.error('Error creating product:', error)
      return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
    }

    // Create default variant if none provided
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
      success: true 
    })

  } catch (error) {
    console.error('Error in products POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
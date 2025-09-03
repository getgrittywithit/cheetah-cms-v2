import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getBrandConfig } from '@/lib/brand-config'

// GET single product
export async function GET(
  request: NextRequest,
  { params }: { params: { brand: string, id: string } }
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

    // Get product
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', params.id)
      .eq('brand_profile_id', brandProfile.id)
      .single()

    if (error || !product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }

    // TODO: Get variants from product_variants table when implemented
    
    return NextResponse.json({ 
      success: true, 
      product: {
        ...product,
        product_type: product.product_type || 'handmade',
        variants: [] // Will be populated from variants table
      }
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

// PUT update product
export async function PUT(
  request: NextRequest,
  { params }: { params: { brand: string, id: string } }
) {
  try {
    const brandConfig = getBrandConfig(params.brand)
    if (!brandConfig) {
      return NextResponse.json({ success: false, error: 'Invalid brand' }, { status: 404 })
    }

    const updates = await request.json()

    // Get brand profile
    const { data: brandProfile } = await supabaseAdmin
      .from('brand_profiles')
      .select('id')
      .eq('slug', params.brand)
      .single()

    if (!brandProfile) {
      return NextResponse.json({ success: false, error: 'Brand not found' }, { status: 404 })
    }

    // Update product
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .update({
        name: updates.name,
        description: updates.description,
        price: updates.price,
        status: updates.status,
        featured_image: updates.featured_image,
        images: updates.images,
        tags: updates.tags,
        seo_title: updates.seo_title,
        seo_description: updates.seo_description,
        slug: updates.slug,
        product_type: updates.product_type || 'handmade',
        primary_category_id: updates.primary_category_id || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('brand_profile_id', brandProfile.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating product:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update product' },
        { status: 500 }
      )
    }

    // TODO: Update variants in product_variants table when implemented

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

// DELETE product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { brand: string, id: string } }
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

    // Delete product
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', params.id)
      .eq('brand_profile_id', brandProfile.id)

    if (error) {
      console.error('Error deleting product:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete product' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
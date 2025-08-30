import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { ProductUpdate } from '@/types/product'

// GET /api/products/[id] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select(`
        *,
        product_variants(*)
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching product:', error)
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      product,
      success: true 
    })

  } catch (error) {
    console.error('Error in product GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      short_description,
      price,
      compare_at_price,
      cost_per_item,
      sku,
      track_inventory,
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
      seo_description
    } = body

    // Generate new slug if name changed
    let slug = undefined
    if (name) {
      slug = name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    }

    const productData: ProductUpdate = {
      name,
      description,
      short_description,
      slug,
      sku,
      price,
      compare_at_price,
      cost_per_item,
      track_inventory,
      continue_selling_when_out_of_stock: track_inventory ? !track_inventory : undefined,
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
      published_at: status === 'active' ? new Date().toISOString() : undefined,
      updated_at: new Date().toISOString()
    }

    // Remove undefined values
    Object.keys(productData).forEach(key => {
      if (productData[key as keyof ProductUpdate] === undefined) {
        delete productData[key as keyof ProductUpdate]
      }
    })

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .update(productData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating product:', error)
      return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
    }

    // Update default variant if price changed
    if (price !== undefined) {
      await supabaseAdmin
        .from('product_variants')
        .update({ 
          price,
          compare_at_price,
          sku,
          weight,
          weight_unit,
          inventory_quantity: quantity,
          requires_shipping
        })
        .eq('product_id', params.id)
        .eq('position', 1)
    }

    return NextResponse.json({ 
      product,
      success: true 
    })

  } catch (error) {
    console.error('Error in product PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // First delete all variants
    const { error: variantsError } = await supabaseAdmin
      .from('product_variants')
      .delete()
      .eq('product_id', params.id)

    if (variantsError) {
      console.error('Error deleting product variants:', variantsError)
      return NextResponse.json({ error: 'Failed to delete product variants' }, { status: 500 })
    }

    // Then delete the product
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting product:', error)
      return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Product deleted successfully'
    })

  } catch (error) {
    console.error('Error in product DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
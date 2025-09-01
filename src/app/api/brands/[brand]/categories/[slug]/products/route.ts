import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getBrandConfig } from '@/lib/brand-config'

// GET products by category
export async function GET(
  request: NextRequest,
  { params }: { params: { brand: string, slug: string } }
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

    // Get category by slug
    const { data: category } = await supabaseAdmin
      .from('categories')
      .select('id, name, description')
      .eq('slug', params.slug)
      .eq('brand_profile_id', brandProfile.id)
      .single()

    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 })
    }

    // Get query parameters for filtering and sorting
    const { searchParams } = new URL(request.url)
    const sort = searchParams.get('sort') || 'newest'
    const productType = searchParams.get('type')
    const minPrice = searchParams.get('min_price')
    const maxPrice = searchParams.get('max_price')

    // Build query
    let query = supabaseAdmin
      .from('products')
      .select('*')
      .eq('brand_profile_id', brandProfile.id)
      .eq('status', 'active')

    // Filter by category (check both primary category and junction table)
    query = query.or(`primary_category_id.eq.${category.id}`)

    // Apply product type filter
    if (productType) {
      query = query.eq('product_type', productType)
    }

    // Apply price filters
    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice))
    }
    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice))
    }

    // Apply sorting
    switch (sort) {
      case 'price_asc':
        query = query.order('price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price', { ascending: false })
        break
      case 'name_asc':
        query = query.order('name', { ascending: true })
        break
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false })
    }

    const { data: products, error } = await query

    if (error) {
      console.error('Error fetching products by category:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch products' 
      }, { status: 500 })
    }

    // Also get products that have this category in their junction table
    const { data: additionalProducts } = await supabaseAdmin
      .from('product_categories')
      .select('product_id')
      .eq('category_id', category.id)

    if (additionalProducts && additionalProducts.length > 0) {
      const productIds = additionalProducts.map(pc => pc.product_id)
      const { data: moreProducts } = await supabaseAdmin
        .from('products')
        .select('*')
        .in('id', productIds)
        .eq('brand_profile_id', brandProfile.id)
        .eq('status', 'active')

      if (moreProducts) {
        // Merge and deduplicate products
        const allProducts = [...(products || []), ...(moreProducts || [])]
        const uniqueProducts = Array.from(
          new Map(allProducts.map(p => [p.id, p])).values()
        )
        
        return NextResponse.json({ 
          success: true, 
          category: {
            id: category.id,
            name: category.name,
            description: category.description,
            slug: params.slug
          },
          products: uniqueProducts,
          total: uniqueProducts.length
        })
      }
    }

    return NextResponse.json({ 
      success: true, 
      category: {
        id: category.id,
        name: category.name,
        description: category.description,
        slug: params.slug
      },
      products: products || [],
      total: products?.length || 0
    })
  } catch (error) {
    console.error('Error fetching products by category:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
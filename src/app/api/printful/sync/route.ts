import { NextRequest, NextResponse } from 'next/server'
import { printfulAPI } from '@/lib/printful-api'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('Syncing products from Printful...')
    console.log('API Token present:', !!process.env.PRINTFUL_API_TOKEN)
    console.log('Token starts with:', process.env.PRINTFUL_API_TOKEN?.substring(0, 10))
    console.log('Store ID:', process.env.PRINTFUL_STORE_ID || '16574654')
    
    // Get brand from query params
    const { searchParams } = new URL(request.url)
    const brandSlug = searchParams.get('brand')
    
    if (!brandSlug) {
      return NextResponse.json(
        { success: false, error: 'Brand parameter is required' },
        { status: 400 }
      )
    }

    // Get brand profile
    const { data: brandProfile, error: brandError } = await supabase
      .from('brand_profiles')
      .select('id, name, slug')
      .eq('slug', brandSlug)
      .single()

    if (brandError || !brandProfile) {
      return NextResponse.json(
        { success: false, error: 'Brand not found' },
        { status: 404 }
      )
    }
    
    // Get all sync products from Printful
    const printfulProducts = await printfulAPI.getSyncProducts()
    
    // Sync products to database
    const syncedProducts = []
    
    for (const printfulProduct of printfulProducts) {
      try {
        // Get full product details
        const fullProduct = await printfulAPI.getSyncProduct(printfulProduct.id)
        const transformedProduct = printfulAPI.transformProduct(fullProduct)

        // Check if product already exists
        const { data: existingProduct, error: checkError } = await supabase
          .from('products')
          .select('id, printful_sync_product_id')
          .eq('brand_profile_id', brandProfile.id)
          .eq('printful_sync_product_id', printfulProduct.id.toString())
          .single()

        if (checkError && checkError.code !== 'PGRST116') {
          console.error('Error checking existing product:', checkError)
          continue
        }

        const productData = {
          name: transformedProduct.name,
          description: `Print-on-demand product from Printful`,
          slug: transformedProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          product_type: 'printful',
          price: transformedProduct.base_price,
          status: 'active' as const,
          visibility: 'visible' as const,
          requires_shipping: true,
          is_physical: true,
          track_inventory: false,
          featured_image: transformedProduct.thumbnail,
          printful_sync_product_id: printfulProduct.id.toString(),
          brand_profile_id: brandProfile.id,
          tags: ['printful', 'print-on-demand']
        }

        let product
        
        if (existingProduct) {
          // Update existing product
          const { data: updatedProduct, error: updateError } = await supabase
            .from('products')
            .update(productData)
            .eq('id', existingProduct.id)
            .select()
            .single()

          if (updateError) {
            console.error('Error updating product:', updateError)
            continue
          }
          
          product = updatedProduct
        } else {
          // Create new product
          const { data: newProduct, error: createError } = await supabase
            .from('products')
            .insert(productData)
            .select()
            .single()

          if (createError) {
            console.error('Error creating product:', createError)
            continue
          }
          
          product = newProduct
        }

        syncedProducts.push({
          ...product,
          printful_data: transformedProduct
        })

      } catch (error) {
        console.error(`Error syncing product ${printfulProduct.id}:`, error)
        continue
      }
    }
    
    return NextResponse.json({
      success: true,
      products: syncedProducts,
      synced_count: syncedProducts.length,
      total_printful_products: printfulProducts.length,
      message: `Synced ${syncedProducts.length} of ${printfulProducts.length} products from Printful to ${brandProfile.name}`
    })
  } catch (error) {
    console.error('Printful sync error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to sync products from Printful'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { product_id } = await request.json()
    
    if (!product_id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Get specific product with full details
    const printfulProduct = await printfulAPI.getSyncProduct(product_id)
    const transformedProduct = printfulAPI.transformProduct(printfulProduct)
    
    return NextResponse.json({
      success: true,
      product: transformedProduct,
      message: `Synced product: ${printfulProduct.name}`
    })
  } catch (error) {
    console.error('Printful product sync error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to sync product from Printful'
      },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { printfulAPI } from '@/lib/printful-api'
import { supabaseAdmin } from '@/lib/supabase'

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

    // Get brand profile or create one if it doesn't exist
    let { data: brandProfile, error: brandError } = await supabaseAdmin
      .from('brand_profiles')
      .select('id, name, slug')
      .eq('slug', brandSlug)
      .single()

    // If brand profile doesn't exist, create it
    if (brandError && brandError.code === 'PGRST116') {
      const brandConfig = await import('@/lib/brand-config').then(m => m.getBrandConfig(brandSlug))
      
      if (!brandConfig) {
        return NextResponse.json(
          { success: false, error: 'Brand configuration not found' },
          { status: 404 }
        )
      }

      const { data: newBrandProfile, error: createError } = await supabaseAdmin
        .from('brand_profiles')
        .insert({
          name: brandConfig.name,
          slug: brandConfig.slug,
          description: brandConfig.description
        })
        .select('id, name, slug')
        .single()

      if (createError) {
        console.error('Error creating brand profile:', createError)
        return NextResponse.json(
          { success: false, error: 'Failed to create brand profile' },
          { status: 500 }
        )
      }

      brandProfile = newBrandProfile
    } else if (brandError) {
      return NextResponse.json(
        { success: false, error: 'Database error accessing brand profile' },
        { status: 500 }
      )
    }
    
    // Get all sync products from Printful
    console.log('Fetching products from Printful API...')
    const printfulProducts = await printfulAPI.getSyncProducts()
    console.log(`Found ${printfulProducts.length} products in Printful`)
    
    if (printfulProducts.length === 0) {
      console.log('No products found in Printful - check your Printful dashboard')
      return NextResponse.json({
        success: true,
        products: [],
        synced_count: 0,
        total_printful_products: 0,
        message: `No products found in Printful. Make sure you have products in your Printful store.`
      })
    }
    
    // Sync products to database
    const syncedProducts = []
    let processedCount = 0
    let skippedCount = 0
    let errorCount = 0
    
    for (const printfulProduct of printfulProducts) {
      try {
        processedCount++
        console.log(`\n=== Processing Printful Product ${printfulProduct.id}: ${printfulProduct.name} ===`)
        
        // TEMPORARY: Skip the getSyncProduct call and work with basic data
        console.log('Using basic product data for now...')
        console.log('Basic product:', JSON.stringify(printfulProduct, null, 2))
        
        const transformedProduct = printfulAPI.transformProduct(printfulProduct)
        console.log('Transformed product:', JSON.stringify(transformedProduct, null, 2))
        
        // Additional validation
        if (!transformedProduct || typeof transformedProduct !== 'object') {
          console.error(`Invalid transformed product for ${printfulProduct.id}:`, transformedProduct)
          skippedCount++
          continue
        }

        // Check if product already exists
        const { data: existingProduct, error: checkError } = await supabaseAdmin
          .from('products')
          .select('id, printful_sync_product_id')
          .eq('brand_profile_id', brandProfile.id)
          .eq('printful_sync_product_id', printfulProduct.id.toString())
          .single()

        if (checkError && checkError.code !== 'PGRST116') {
          console.error('Error checking existing product:', checkError)
          errorCount++
          continue
        }

        // Get a user ID for the product (using first available user)
        const { data: userProfile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .limit(1)
          .single()

        // Validate required fields
        if (!transformedProduct.name) {
          console.error(`Product ${printfulProduct.id} missing name, skipping`)
          skippedCount++
          continue
        }

        const productData = {
          user_id: userProfile?.id || null,
          name: transformedProduct.name,
          description: transformedProduct.description || `Print-on-demand product from Printful`,
          slug: transformedProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 100),
          product_type: 'printful',
          price: transformedProduct.base_price || 0,
          status: 'active' as const,
          visibility: 'visible' as const,
          requires_shipping: true,
          is_physical: true,
          track_inventory: false,
          featured_image: transformedProduct.thumbnail || null,
          printful_sync_product_id: printfulProduct.id.toString(),
          brand_profile_id: brandProfile.id,
          tags: ['printful', 'print-on-demand', brandSlug]
        }

        console.log(`About to ${existingProduct ? 'update' : 'create'} product with data:`, JSON.stringify(productData, null, 2))
        
        let product
        
        if (existingProduct) {
          // Update existing product
          console.log(`Updating existing product ${existingProduct.id}`)
          const { data: updatedProduct, error: updateError } = await supabaseAdmin
            .from('products')
            .update(productData)
            .eq('id', existingProduct.id)
            .select()
            .single()

          if (updateError) {
            console.error('Error updating product:', updateError)
            console.error('Product data that failed:', JSON.stringify(productData, null, 2))
            errorCount++
            continue
          }
          
          console.log('Successfully updated product:', updatedProduct?.id)
          product = updatedProduct
        } else {
          // Create new product
          console.log('Creating new product')
          const { data: newProduct, error: createError } = await supabaseAdmin
            .from('products')
            .insert(productData)
            .select()
            .single()

          if (createError) {
            console.error('Error creating product:', createError)
            console.error('Product data that failed:', JSON.stringify(productData, null, 2))
            errorCount++
            continue
          }
          
          console.log('Successfully created product:', newProduct?.id)
          product = newProduct
        }

        syncedProducts.push({
          ...product,
          printful_data: transformedProduct
        })

      } catch (error) {
        console.error(`Error syncing product ${printfulProduct.id}:`, error)
        errorCount++
        continue
      }
    }
    
    console.log(`\n=== SYNC SUMMARY ===`)
    console.log(`Processed: ${processedCount}`)
    console.log(`Skipped: ${skippedCount}`) 
    console.log(`Errors: ${errorCount}`)
    console.log(`Synced: ${syncedProducts.length}`)
    
    return NextResponse.json({
      success: true,
      products: syncedProducts,
      synced_count: syncedProducts.length,
      total_printful_products: printfulProducts.length,
      processed_count: processedCount,
      skipped_count: skippedCount,
      error_count: errorCount,
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
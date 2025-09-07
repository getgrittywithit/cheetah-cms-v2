import { NextRequest, NextResponse } from 'next/server'
import { printfulMockupAPI } from '@/lib/printful-mockup-api'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: { brand: string } }
) {
  try {
    const body = await request.json()
    const { designUrl, productSyncId, productIds } = body

    if (!designUrl || (!productSyncId && !productIds)) {
      return NextResponse.json(
        { success: false, error: 'Design URL and product selection required' },
        { status: 400 }
      )
    }

    // Step 1: Upload design to Printful
    console.log('Uploading design to Printful...')
    const fileResult = await printfulMockupAPI.uploadDesignFile(
      designUrl,
      `${params.brand}-design-${Date.now()}.png`
    )
    const fileId = fileResult.id

    // Step 2: Get products to update
    let productsToUpdate = []
    
    if (productSyncId) {
      // Update all variants of a Printful product
      const { data: products } = await supabaseAdmin
        .from('products')
        .select('id, name, printful_sync_product_id, printful_variant_id')
        .eq('brand_profile_id', params.brand)
        .eq('printful_sync_product_id', productSyncId)
      
      productsToUpdate = products || []
    } else if (productIds && Array.isArray(productIds)) {
      // Update specific products
      const { data: products } = await supabaseAdmin
        .from('products')
        .select('id, name, printful_sync_product_id, printful_variant_id')
        .eq('brand_profile_id', params.brand)
        .in('id', productIds)
      
      productsToUpdate = products || []
    }

    if (productsToUpdate.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No products found to update' },
        { status: 404 }
      )
    }

    // Step 3: Generate mockups for the sync product
    console.log(`Generating mockups for ${productsToUpdate.length} products...`)
    const mockups = await printfulMockupAPI.generateMockups(
      productSyncId || productsToUpdate[0].printful_sync_product_id,
      fileId
    )

    // Step 4: Update products with new mockup images
    const updatePromises = productsToUpdate.map(async (product) => {
      // Find the mockup for this specific variant
      const variantMockup = mockups.find(
        m => m.variant_ids.includes(parseInt(product.printful_variant_id))
      )

      if (variantMockup && variantMockup.mockup_url) {
        return supabaseAdmin
          .from('products')
          .update({
            featured_image: variantMockup.mockup_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', product.id)
      }
    })

    await Promise.all(updatePromises.filter(Boolean))

    return NextResponse.json({
      success: true,
      message: `Successfully generated mockups for ${productsToUpdate.length} products`,
      mockupsGenerated: mockups.length,
      productsUpdated: productsToUpdate.length
    })

  } catch (error) {
    console.error('Error generating mockups:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate mockups' 
      },
      { status: 500 }
    )
  }
}
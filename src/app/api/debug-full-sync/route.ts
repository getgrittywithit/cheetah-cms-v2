import { NextResponse } from 'next/server'
import { printfulAPI } from '@/lib/printful-api'

export async function GET() {
  try {
    console.log('=== DEBUG FULL SYNC PROCESS ===')
    
    // Step 1: Get basic products
    const basicProducts = await printfulAPI.getSyncProducts()
    console.log(`Found ${basicProducts.length} basic products`)
    
    if (basicProducts.length === 0) {
      return NextResponse.json({ error: 'No basic products found' })
    }
    
    const results = []
    
    // Step 2: Process each product like the sync does
    for (const basicProduct of basicProducts) {
      try {
        console.log(`Processing product ${basicProduct.id}: ${basicProduct.name}`)
        
        // Step 3: Get full product details (this is where it might be failing)
        console.log('Fetching full product details...')
        const fullProduct = await printfulAPI.getSyncProduct(basicProduct.id)
        console.log('Got full product, transforming...')
        
        // Step 4: Transform
        const transformed = printfulAPI.transformProduct(fullProduct)
        
        // Step 5: Check name validation
        const hasValidName = transformed && transformed.name && transformed.name.trim().length > 0
        
        results.push({
          basicProduct,
          fullProduct,
          transformed,
          hasValidName,
          validationPass: hasValidName
        })
        
      } catch (error) {
        console.error(`Error processing product ${basicProduct.id}:`, error)
        results.push({
          basicProduct,
          error: error instanceof Error ? error.message : String(error),
          validationPass: false
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      totalProducts: basicProducts.length,
      results,
      summary: {
        successful: results.filter(r => r.validationPass).length,
        failed: results.filter(r => !r.validationPass).length
      }
    })
    
  } catch (error) {
    console.error('Debug full sync error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    })
  }
}
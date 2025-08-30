import { NextResponse } from 'next/server'
import { printfulAPI } from '@/lib/printful-api'

export async function GET() {
  try {
    console.log('Starting debug sync test...')
    
    // Get all sync products first
    const products = await printfulAPI.getSyncProducts()
    console.log(`Found ${products.length} products`)
    
    if (products.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No products found',
        products: []
      })
    }
    
    // Test getting full details for first product
    const firstProduct = products[0]
    console.log('First product basic info:', JSON.stringify(firstProduct, null, 2))
    
    try {
      console.log(`Getting full details for product ${firstProduct.id}`)
      const fullProduct = await printfulAPI.getSyncProduct(firstProduct.id)
      console.log('Full product details:', JSON.stringify(fullProduct, null, 2))
      
      // Test transformation
      const transformed = printfulAPI.transformProduct(fullProduct)
      console.log('Transformed product:', JSON.stringify(transformed, null, 2))
      
      return NextResponse.json({
        success: true,
        basicProduct: firstProduct,
        fullProduct: fullProduct,
        transformedProduct: transformed,
        totalProducts: products.length
      })
      
    } catch (fullProductError) {
      console.error('Error getting full product:', fullProductError)
      
      // Try transforming the basic product instead
      const transformed = printfulAPI.transformProduct(firstProduct)
      console.log('Transformed basic product:', JSON.stringify(transformed, null, 2))
      
      return NextResponse.json({
        success: false,
        error: 'Could not get full product details',
        basicProduct: firstProduct,
        transformedBasicProduct: transformed,
        errorMessage: fullProductError instanceof Error ? fullProductError.message : String(fullProductError)
      })
    }
    
  } catch (error) {
    console.error('Debug sync error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    })
  }
}
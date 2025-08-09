import { NextResponse } from 'next/server'
import { printfulAPI } from '@/lib/printful-api'

export async function GET() {
  try {
    console.log('Syncing products from Printful...')
    console.log('API Token present:', !!process.env.PRINTFUL_API_TOKEN)
    console.log('Token starts with:', process.env.PRINTFUL_API_TOKEN?.substring(0, 10))
    console.log('Store ID:', process.env.PRINTFUL_STORE_ID || '16574654')
    
    // Get all sync products from Printful
    const printfulProducts = await printfulAPI.getSyncProducts()
    
    // Transform products to our format
    const products = printfulProducts.map(product => 
      printfulAPI.transformProduct(product)
    )
    
    return NextResponse.json({
      success: true,
      products,
      count: products.length,
      message: `Synced ${products.length} products from Printful`
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
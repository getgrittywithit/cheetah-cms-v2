import { NextResponse } from 'next/server'
import { shopifyAPI } from '@/lib/shopify-api'
import { printfulAPI } from '@/lib/printful-api'

export async function POST(request: Request) {
  try {
    const { 
      printful_product_id,
      custom_title,
      custom_description,
      custom_tags,
      seo_title,
      seo_description,
      status = 'draft'
    } = await request.json()

    if (!printful_product_id) {
      return NextResponse.json(
        { success: false, error: 'Printful product ID is required' },
        { status: 400 }
      )
    }

    console.log(`Publishing Printful product ${printful_product_id} to Shopify...`)

    // Get the full product details from Printful
    const printfulProduct = await printfulAPI.getSyncProduct(printful_product_id)
    const transformedProduct = printfulAPI.transformProduct(printfulProduct)

    // Transform to Shopify format with custom data
    const shopifyProductData = shopifyAPI.transformPrintfulToShopify(
      transformedProduct,
      {
        title: custom_title,
        description: custom_description,
        tags: custom_tags,
        seoTitle: seo_title,
        seoDescription: seo_description,
        status
      }
    )

    // Create product in Shopify
    const createdProduct = await shopifyAPI.createProduct(shopifyProductData)

    // TODO: Upload additional product images if provided
    // TODO: Set up inventory tracking
    // TODO: Add to collections if specified

    return NextResponse.json({
      success: true,
      shopify_product: createdProduct,
      printful_product: transformedProduct,
      message: `Successfully published "${createdProduct.title}" to Shopify`
    })

  } catch (error) {
    console.error('Shopify publish error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to publish product to Shopify'
      },
      { status: 500 }
    )
  }
}

// Get shop info for testing connection
export async function GET() {
  try {
    const shopInfo = await shopifyAPI.getShopInfo()
    
    return NextResponse.json({
      success: true,
      shop: {
        name: shopInfo.name,
        domain: shopInfo.domain,
        email: shopInfo.email,
        currency: shopInfo.currency,
        timezone: shopInfo.timezone
      },
      message: 'Shopify connection successful'
    })
  } catch (error) {
    console.error('Shopify connection error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to connect to Shopify'
      },
      { status: 500 }
    )
  }
}
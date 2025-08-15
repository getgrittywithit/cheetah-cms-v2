import { NextResponse } from 'next/server'
import { shopifyAPI } from '@/lib/shopify-api'
import { printfulAPI } from '@/lib/printful-api'

export async function POST(request: Request) {
  try {
    const requestBody = await request.json()
    console.log('Received request body:', requestBody)
    
    const { 
      printful_product_id,
      // AI Generated data (all fields)
      title,
      description,
      category,
      price,
      compareAtPrice,
      chargesTax,
      costPerItem,
      trackQuantity,
      sku,
      barcode,
      continueSellingWhenOutOfStock,
      isPhysicalProduct,
      weight,
      weightUnit,
      type,
      vendor,
      collections,
      tags,
      themeTemplate,
      status,
      salesChannels,
      seoTitle,
      seoDescription,
      urlHandle,
      // Legacy fields for backward compatibility
      custom_title,
      custom_description,
      custom_tags,
      seo_title,
      seo_description
    } = requestBody

    if (!printful_product_id) {
      return NextResponse.json(
        { success: false, error: 'Printful product ID is required' },
        { status: 400 }
      )
    }

    console.log(`Publishing Printful product ${printful_product_id} to Shopify...`)
    
    // Test Shopify connection first
    try {
      const shopInfo = await shopifyAPI.getShopInfo()
      console.log('Shopify connection verified:', shopInfo.name)
    } catch (error) {
      console.error('Shopify connection failed:', error)
      throw new Error(`Shopify connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // Get the full product details from Printful
    const printfulProduct = await printfulAPI.getSyncProduct(printful_product_id)
    const transformedProduct = printfulAPI.transformProduct(printfulProduct)

    // Use AI data if available, fall back to legacy fields
    const finalData = {
      title: title || custom_title,
      description: description || custom_description,
      tags: tags || custom_tags,
      seoTitle: seoTitle || seo_title,
      seoDescription: seoDescription || seo_description,
      status: status || 'draft',
      // Additional AI fields
      category,
      price,
      compareAtPrice,
      chargesTax,
      costPerItem,
      trackQuantity,
      sku,
      barcode,
      continueSellingWhenOutOfStock,
      isPhysicalProduct,
      weight,
      weightUnit,
      type,
      vendor,
      collections,
      urlHandle
    }
    
    console.log('Final data for transformation:', finalData)

    // Transform to Shopify format with complete data
    const shopifyProductData = shopifyAPI.transformPrintfulToShopify(
      transformedProduct,
      finalData
    )
    
    console.log('Shopify product data to send:', shopifyProductData)

    // Create product in Shopify
    const createdProduct = await shopifyAPI.createProduct(shopifyProductData)

    // Add to collections if specified
    if (finalData.collections && Array.isArray(finalData.collections) && createdProduct.id) {
      try {
        for (const collectionName of finalData.collections) {
          await shopifyAPI.addProductToCollection(createdProduct.id, collectionName)
        }
      } catch (error) {
        console.error('Failed to add to collections:', error)
        // Continue anyway - product was created successfully
      }
    }

    return NextResponse.json({
      success: true,
      shopify_product: createdProduct,
      printful_product: transformedProduct,
      message: `Successfully published "${createdProduct.title}" to Shopify`
    })

  } catch (error) {
    console.error('Shopify publish error:', error)
    
    // Log the full error details for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to publish product to Shopify',
        details: error instanceof Error ? error.stack : String(error)
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
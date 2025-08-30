import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const token = process.env.PRINTFUL_API_TOKEN
    const storeId = process.env.PRINTFUL_STORE_ID || '16574654'
    
    console.log('Testing Printful API connection...')
    console.log('Token present:', !!token)
    console.log('Token length:', token?.length || 0)
    console.log('Store ID:', storeId)
    
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'PRINTFUL_API_TOKEN not found in environment variables'
      })
    }

    // Test basic API connection
    const response = await fetch('https://api.printful.com/sync/products', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-PF-Store-Id': storeId,
      },
    })

    console.log('Printful API Response Status:', response.status)
    console.log('Printful API Response Headers:', Object.fromEntries(response.headers))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Printful API Error Response:', errorText)
      
      return NextResponse.json({
        success: false,
        error: `Printful API Error: ${response.status} - ${response.statusText}`,
        details: errorText,
        status: response.status,
        headers: Object.fromEntries(response.headers)
      })
    }

    const data = await response.json()
    console.log('Printful API Success Response:', data)

    // Test getting full product details for first product
    let fullProductExample = null
    if (data.result && data.result.length > 0) {
      try {
        const firstProductId = data.result[0].id
        console.log(`Testing full product fetch for ID: ${firstProductId}`)
        
        const fullProductResponse = await fetch(`https://api.printful.com/sync/products/${firstProductId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-PF-Store-Id': storeId,
          },
        })
        
        if (fullProductResponse.ok) {
          const fullProductData = await fullProductResponse.json()
          fullProductExample = fullProductData.result
          console.log('Full product data:', JSON.stringify(fullProductData.result, null, 2))
        }
      } catch (err) {
        console.error('Error fetching full product:', err)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Printful API connection successful',
      productCount: data.result?.length || 0,
      products: data.result || [],
      fullProductExample,
      fullResponse: data
    })

  } catch (error) {
    console.error('Test Printful API Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error testing Printful API',
      stack: error instanceof Error ? error.stack : undefined
    })
  }
}
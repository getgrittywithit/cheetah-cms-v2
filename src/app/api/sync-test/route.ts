import { NextResponse } from 'next/server'
import { printfulAPI } from '@/lib/printful-api'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('=== SYNC TEST DEBUG ===')
    
    // Test 1: Get products from Printful
    console.log('1. Testing Printful API...')
    const products = await printfulAPI.getSyncProducts()
    console.log(`Found ${products.length} products`)
    
    if (products.length === 0) {
      return NextResponse.json({ error: 'No Printful products found' })
    }
    
    // Test 2: Transform first product
    console.log('2. Testing product transformation...')
    const firstProduct = products[0]
    const transformed = printfulAPI.transformProduct(firstProduct)
    console.log('Transformed:', transformed)
    
    // Test 3: Check brand profile exists
    console.log('3. Testing brand profile lookup...')
    const { data: brandProfile, error: brandError } = await supabaseAdmin
      .from('brand_profiles')
      .select('id, name, slug')
      .eq('slug', 'grit-collective')
      .single()
    
    if (brandError) {
      return NextResponse.json({ 
        error: 'Brand profile error', 
        details: brandError,
        step: 'brand_lookup'
      })
    }
    
    console.log('Brand profile:', brandProfile)
    
    // Test 4: Check profiles table for user_id
    console.log('4. Testing profiles lookup...')
    const { data: userProfile, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .limit(1)
      .single()
    
    if (userError) {
      return NextResponse.json({
        error: 'User profile error',
        details: userError,
        step: 'user_lookup'
      })
    }
    
    console.log('User profile:', userProfile)
    
    // Test 5: Try a simple product insert
    console.log('5. Testing product insert...')
    const testProductData = {
      user_id: userProfile.id,
      name: `TEST: ${transformed.name}`,
      description: 'Test product from sync debug',
      slug: `test-${Date.now()}`,
      product_type: 'printful',
      price: 20.00,
      status: 'active',
      visibility: 'visible',
      requires_shipping: true,
      is_physical: true,
      track_inventory: false,
      printful_sync_product_id: firstProduct.id.toString(),
      brand_profile_id: brandProfile.id,
      tags: ['test', 'printful']
    }
    
    const { data: newProduct, error: insertError } = await supabaseAdmin
      .from('products')
      .insert(testProductData)
      .select()
      .single()
    
    if (insertError) {
      return NextResponse.json({
        error: 'Product insert failed',
        details: insertError,
        productData: testProductData,
        step: 'product_insert'
      })
    }
    
    console.log('Successfully created test product:', newProduct.id)
    
    return NextResponse.json({
      success: true,
      message: 'All tests passed',
      steps: {
        printful_products: products.length,
        transformed_product: transformed,
        brand_profile: brandProfile,
        user_profile: userProfile,
        created_product: newProduct
      }
    })
    
  } catch (error) {
    console.error('Sync test error:', error)
    return NextResponse.json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : String(error)
    })
  }
}
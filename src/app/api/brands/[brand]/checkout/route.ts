import { NextRequest, NextResponse } from 'next/server'
import { getStripeInstance, formatPriceForStripe } from '@/lib/stripe'
import { getBrandStripeConfig } from '@/lib/brand-stripe-config'
import { getBrandConfig } from '@/lib/brand-config'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: { brand: string } }
) {
  try {
    const brandConfig = getBrandConfig(params.brand)
    if (!brandConfig) {
      return NextResponse.json({ success: false, error: 'Invalid brand' }, { status: 404 })
    }

    const stripe = getStripeInstance(params.brand)
    const stripeConfig = getBrandStripeConfig(params.brand)
    
    if (!stripe || !stripeConfig) {
      return NextResponse.json({ 
        success: false, 
        error: 'Stripe not configured for this brand' 
      }, { status: 500 })
    }

    const body = await request.json()
    const { items, customer_email, success_url, cancel_url, metadata = {} } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Items array is required' 
      }, { status: 400 })
    }

    // Get brand profile for database operations
    const { data: brandProfile } = await supabaseAdmin
      .from('brand_profiles')
      .select('id')
      .eq('slug', params.brand)
      .single()

    if (!brandProfile) {
      return NextResponse.json({ success: false, error: 'Brand not found' }, { status: 404 })
    }

    // Validate products and build line items
    const lineItems = []
    const orderItems = []

    for (const item of items) {
      const { product_id, quantity = 1 } = item

      // Get product from database
      const { data: product } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('id', product_id)
        .eq('brand_profile_id', brandProfile.id)
        .eq('status', 'active')
        .single()

      if (!product) {
        return NextResponse.json({ 
          success: false, 
          error: `Product ${product_id} not found or inactive` 
        }, { status: 400 })
      }

      // Build Stripe line item
      lineItems.push({
        price_data: {
          currency: stripeConfig.currency || 'usd',
          product_data: {
            name: product.name,
            description: product.description || undefined,
            images: product.featured_image ? [product.featured_image] : undefined,
            metadata: {
              product_id: product.id,
              product_type: product.product_type || 'handmade',
            }
          },
          unit_amount: formatPriceForStripe(product.price),
        },
        quantity: quantity,
      })

      // Store order item for later
      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        product_type: product.product_type || 'handmade',
        price: product.price,
        quantity: quantity,
      })
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: customer_email || undefined,
      success_url: success_url || `${request.nextUrl.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${request.nextUrl.origin}/checkout/cancelled`,
      metadata: {
        brand_slug: params.brand,
        brand_profile_id: brandProfile.id,
        order_items: JSON.stringify(orderItems),
        ...metadata
      },
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'ES', 'IT'], // Add more as needed
      },
      payment_intent_data: {
        description: `${brandConfig.name} Order`,
        statement_descriptor: stripeConfig.statementDescriptor,
        metadata: {
          brand_slug: params.brand,
          brand_profile_id: brandProfile.id,
        }
      }
    })

    return NextResponse.json({
      success: true,
      session_id: session.id,
      url: session.url,
      session
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
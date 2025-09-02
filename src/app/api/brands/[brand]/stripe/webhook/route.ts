import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { getStripeInstance } from '@/lib/stripe'
import { getBrandStripeConfig } from '@/lib/brand-stripe-config'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: { brand: string } }
) {
  try {
    const stripe = getStripeInstance(params.brand)
    const stripeConfig = getBrandStripeConfig(params.brand)
    
    if (!stripe || !stripeConfig?.webhookSecret) {
      return NextResponse.json({ 
        success: false, 
        error: 'Stripe not configured' 
      }, { status: 500 })
    }

    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ 
        success: false, 
        error: 'No signature header' 
      }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, stripeConfig.webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid signature' 
      }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
      
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
        break
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ success: true, received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Webhook processing failed' 
    }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log('Processing completed checkout session:', session.id)

    const metadata = session.metadata
    if (!metadata?.brand_profile_id || !metadata?.order_items) {
      console.error('Missing required metadata in checkout session')
      return
    }

    const orderItems = JSON.parse(metadata.order_items)
    const brandProfileId = metadata.brand_profile_id

    // Create order record
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        brand_profile_id: brandProfileId,
        stripe_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent as string,
        customer_email: session.customer_details?.email,
        customer_name: session.customer_details?.name,
        billing_address: session.customer_details?.address,
        shipping_address: session.shipping_details?.address,
        total_amount: session.amount_total ? session.amount_total / 100 : 0,
        currency: session.currency || 'usd',
        status: 'paid',
        items: orderItems,
        metadata: metadata
      })
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return
    }

    console.log('Order created successfully:', order.id)

    // Send order notification to CMS for confirmation email
    await sendOrderNotificationToCMS({
      orderId: session.id,
      brandSlug: metadata.brand_slug || 'grit-collective',
      customerEmail: session.customer_details?.email || '',
      customerName: session.customer_details?.name || undefined,
      items: orderItems,
      total: session.amount_total || 0,
      currency: session.currency || 'usd'
    })

    // TODO: Notify brand owner
    // TODO: Update inventory if needed

  } catch (error) {
    console.error('Error handling checkout completed:', error)
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Payment succeeded:', paymentIntent.id)

    // Update order status if needed
    const { error } = await supabaseAdmin
      .from('orders')
      .update({ 
        status: 'paid',
        paid_at: new Date().toISOString()
      })
      .eq('stripe_payment_intent_id', paymentIntent.id)

    if (error) {
      console.error('Error updating order status:', error)
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error)
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Payment failed:', paymentIntent.id)

    // Update order status
    const { error } = await supabaseAdmin
      .from('orders')
      .update({ 
        status: 'payment_failed',
        failure_reason: paymentIntent.last_payment_error?.message
      })
      .eq('stripe_payment_intent_id', paymentIntent.id)

    if (error) {
      console.error('Error updating failed order:', error)
    }
  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
}

interface OrderNotification {
  orderId: string
  brandSlug: string
  customerEmail: string
  customerName?: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  total: number
  currency: string
}

async function sendOrderNotificationToCMS(orderData: OrderNotification) {
  try {
    // Get the CMS base URL - in development it's the same server, in production it would be the CMS domain
    const cmsBaseUrl = process.env.CMS_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3001'
    
    console.log('Sending order notification to CMS:', { 
      cmsBaseUrl, 
      orderData: { ...orderData, items: `${orderData.items.length} items` } 
    })
    
    const response = await fetch(`${cmsBaseUrl}/api/webhooks/storefront/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    })

    const responseText = await response.text()
    console.log('CMS response:', { status: response.status, body: responseText })

    if (!response.ok) {
      throw new Error(`CMS notification failed: ${response.status} ${response.statusText} - ${responseText}`)
    }

    const result = JSON.parse(responseText)
    console.log('Order notification sent to CMS successfully:', result)
    
  } catch (error) {
    console.error('Failed to send order notification to CMS:', error)
    // Don't throw - we don't want to fail the webhook if email fails
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-pf-signature')
    
    // Verify webhook signature if secret is configured
    if (process.env.PRINTFUL_WEBHOOK_SECRET && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.PRINTFUL_WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex')
      
      if (signature !== expectedSignature) {
        return NextResponse.json(
          { success: false, error: 'Invalid webhook signature' },
          { status: 401 }
        )
      }
    }

    const data = JSON.parse(rawBody)
    const { type, data: webhookData } = data

    console.log('Printful webhook received:', type, webhookData?.id)

    switch (type) {
      case 'order_updated':
        return await handleOrderUpdated(webhookData)
      
      case 'order_failed':
        return await handleOrderFailed(webhookData)
      
      case 'order_shipped':
        return await handleOrderShipped(webhookData)
      
      case 'order_canceled':
        return await handleOrderCanceled(webhookData)
      
      case 'product_updated':
        return await handleProductUpdated(webhookData)
      
      case 'product_synced':
        return await handleProductSynced(webhookData)
      
      default:
        console.log('Unhandled webhook type:', type)
        return NextResponse.json({ success: true, message: 'Webhook received but not processed' })
    }

  } catch (error) {
    console.error('Printful webhook error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}

async function handleOrderUpdated(orderData: any) {
  try {
    const { external_id, status, tracking_url, tracking_number } = orderData

    if (!external_id) {
      console.error('No external_id in order update webhook')
      return NextResponse.json({ success: false, error: 'No external_id provided' })
    }

    // Update order in database
    const { error } = await supabase
      .from('orders')
      .update({
        printful_status: status,
        tracking_url,
        tracking_number,
        updated_at: new Date().toISOString()
      })
      .eq('id', external_id)

    if (error) {
      console.error('Error updating order:', error)
      return NextResponse.json({ success: false, error: 'Failed to update order' })
    }

    // TODO: Send notification to customer about order update
    // This could be an email or push notification

    return NextResponse.json({ success: true, message: 'Order updated successfully' })
  } catch (error) {
    console.error('Error handling order update:', error)
    return NextResponse.json({ success: false, error: 'Failed to handle order update' })
  }
}

async function handleOrderFailed(orderData: any) {
  try {
    const { external_id, reason } = orderData

    if (!external_id) {
      console.error('No external_id in order failed webhook')
      return NextResponse.json({ success: false, error: 'No external_id provided' })
    }

    // Update order status
    const { error } = await supabase
      .from('orders')
      .update({
        printful_status: 'failed',
        notes: `Order failed: ${reason}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', external_id)

    if (error) {
      console.error('Error updating failed order:', error)
      return NextResponse.json({ success: false, error: 'Failed to update order' })
    }

    // TODO: Send notification about failed order
    // This should probably notify both customer and store owner

    return NextResponse.json({ success: true, message: 'Order failure recorded' })
  } catch (error) {
    console.error('Error handling order failure:', error)
    return NextResponse.json({ success: false, error: 'Failed to handle order failure' })
  }
}

async function handleOrderShipped(orderData: any) {
  try {
    const { external_id, tracking_url, tracking_number, shipments } = orderData

    if (!external_id) {
      console.error('No external_id in order shipped webhook')
      return NextResponse.json({ success: false, error: 'No external_id provided' })
    }

    // Update order with shipping info
    const { error } = await supabase
      .from('orders')
      .update({
        status: 'shipped',
        printful_status: 'shipped',
        tracking_url,
        tracking_number,
        shipped_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', external_id)

    if (error) {
      console.error('Error updating shipped order:', error)
      return NextResponse.json({ success: false, error: 'Failed to update order' })
    }

    // TODO: Send shipping notification to customer
    // Include tracking information

    return NextResponse.json({ success: true, message: 'Order shipping info updated' })
  } catch (error) {
    console.error('Error handling order shipment:', error)
    return NextResponse.json({ success: false, error: 'Failed to handle order shipment' })
  }
}

async function handleOrderCanceled(orderData: any) {
  try {
    const { external_id, reason } = orderData

    if (!external_id) {
      console.error('No external_id in order canceled webhook')
      return NextResponse.json({ success: false, error: 'No external_id provided' })
    }

    // Update order status
    const { error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        printful_status: 'canceled',
        notes: `Order canceled: ${reason}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', external_id)

    if (error) {
      console.error('Error updating canceled order:', error)
      return NextResponse.json({ success: false, error: 'Failed to update order' })
    }

    // TODO: Handle refund process if payment was captured
    // TODO: Send cancellation notification to customer

    return NextResponse.json({ success: true, message: 'Order cancellation recorded' })
  } catch (error) {
    console.error('Error handling order cancellation:', error)
    return NextResponse.json({ success: false, error: 'Failed to handle order cancellation' })
  }
}

async function handleProductUpdated(productData: any) {
  try {
    const { id: printfulProductId } = productData

    if (!printfulProductId) {
      console.error('No product ID in product updated webhook')
      return NextResponse.json({ success: false, error: 'No product ID provided' })
    }

    // Find product in our database
    const { data: product, error: findError } = await supabase
      .from('products')
      .select('id, brand_profile_id')
      .eq('printful_sync_product_id', printfulProductId.toString())
      .single()

    if (findError || !product) {
      console.log('Product not found in database:', printfulProductId)
      return NextResponse.json({ success: true, message: 'Product not in our database' })
    }

    // TODO: Sync updated product data from Printful
    // This could include price changes, availability updates, etc.

    return NextResponse.json({ success: true, message: 'Product update noted' })
  } catch (error) {
    console.error('Error handling product update:', error)
    return NextResponse.json({ success: false, error: 'Failed to handle product update' })
  }
}

async function handleProductSynced(productData: any) {
  try {
    const { id: printfulProductId } = productData

    if (!printfulProductId) {
      console.error('No product ID in product synced webhook')
      return NextResponse.json({ success: false, error: 'No product ID provided' })
    }

    // Update product sync status
    const { error } = await supabase
      .from('products')
      .update({
        updated_at: new Date().toISOString()
      })
      .eq('printful_sync_product_id', printfulProductId.toString())

    if (error) {
      console.error('Error updating product sync status:', error)
    }

    return NextResponse.json({ success: true, message: 'Product sync confirmed' })
  } catch (error) {
    console.error('Error handling product sync:', error)
    return NextResponse.json({ success: false, error: 'Failed to handle product sync' })
  }
}
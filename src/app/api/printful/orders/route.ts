import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Create order in Printful for fulfillment
export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()
    
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Get order details from database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          products(
            *
          )
        ),
        customers(*)
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    // Filter items that need Printful fulfillment
    const printfulItems = order.order_items.filter((item: any) => 
      item.products?.product_type === 'printful' && 
      item.products?.printful_sync_product_id
    )

    if (printfulItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No Printful items in this order' },
        { status: 400 }
      )
    }

    // Prepare Printful order data
    const printfulOrderData = {
      external_id: order.id,
      recipient: {
        name: `${order.shipping_address?.first_name || ''} ${order.shipping_address?.last_name || ''}`.trim() || order.customers?.name || 'Customer',
        address1: order.shipping_address?.address_line_1 || '',
        address2: order.shipping_address?.address_line_2 || '',
        city: order.shipping_address?.city || '',
        state_code: order.shipping_address?.state || '',
        country_code: order.shipping_address?.country || 'US',
        zip: order.shipping_address?.postal_code || '',
        phone: order.shipping_address?.phone || order.customers?.phone || '',
        email: order.customers?.email || order.email || ''
      },
      items: printfulItems.map((item: any) => ({
        sync_variant_id: parseInt(item.products.printful_sync_product_id),
        quantity: item.quantity,
        retail_price: item.price.toString()
      })),
      retail_costs: {
        subtotal: printfulItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0).toFixed(2),
        shipping: order.shipping_cost?.toString() || '0.00',
        tax: order.tax_amount?.toString() || '0.00'
      }
    }

    // Create order in Printful
    const response = await fetch('https://api.printful.com/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PRINTFUL_API_TOKEN}`,
        'Content-Type': 'application/json',
        'X-PF-Store-Id': process.env.PRINTFUL_STORE_ID || ''
      },
      body: JSON.stringify(printfulOrderData)
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('Printful order creation error:', result)
      
      // Update order with error status
      await supabase
        .from('orders')
        .update({
          printful_status: 'error',
          notes: `Printful error: ${result.error?.message || result.result || 'Unknown error'}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      return NextResponse.json(
        { success: false, error: `Printful order creation failed: ${result.error?.message || result.result}` },
        { status: response.status }
      )
    }

    const printfulOrder = result.result

    // Update order with Printful order ID
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        printful_order_id: printfulOrder.id.toString(),
        printful_status: printfulOrder.status,
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Error updating order with Printful ID:', updateError)
    }

    // Auto-confirm the order if it's in draft status
    if (printfulOrder.status === 'draft') {
      try {
        const confirmResponse = await fetch(`https://api.printful.com/orders/${printfulOrder.id}/confirm`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.PRINTFUL_API_TOKEN}`,
            'X-PF-Store-Id': process.env.PRINTFUL_STORE_ID || ''
          }
        })

        if (confirmResponse.ok) {
          const confirmResult = await confirmResponse.json()
          
          // Update order status
          await supabase
            .from('orders')
            .update({
              printful_status: confirmResult.result.status,
              status: 'confirmed',
              updated_at: new Date().toISOString()
            })
            .eq('id', orderId)
        }
      } catch (confirmError) {
        console.error('Error confirming Printful order:', confirmError)
      }
    }

    return NextResponse.json({
      success: true,
      printful_order: printfulOrder,
      message: `Order sent to Printful for fulfillment (Printful Order #${printfulOrder.id})`
    })

  } catch (error) {
    console.error('Printful order creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create Printful order' },
      { status: 500 }
    )
  }
}

// Get Printful order status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    const printfulOrderId = searchParams.get('printfulOrderId')
    
    if (!orderId && !printfulOrderId) {
      return NextResponse.json(
        { success: false, error: 'Either orderId or printfulOrderId is required' },
        { status: 400 }
      )
    }

    let printfulId = printfulOrderId
    
    // If we have order ID, get Printful order ID from database
    if (orderId && !printfulId) {
      const { data: order, error } = await supabase
        .from('orders')
        .select('printful_order_id')
        .eq('id', orderId)
        .single()

      if (error || !order?.printful_order_id) {
        return NextResponse.json(
          { success: false, error: 'Order not found or no Printful order ID' },
          { status: 404 }
        )
      }

      printfulId = order.printful_order_id
    }

    // Get order status from Printful
    const response = await fetch(`https://api.printful.com/orders/${printfulId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.PRINTFUL_API_TOKEN}`,
        'X-PF-Store-Id': process.env.PRINTFUL_STORE_ID || ''
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { success: false, error: `Failed to get Printful order: ${errorData.error?.message || errorData.result}` },
        { status: response.status }
      )
    }

    const result = await response.json()
    
    return NextResponse.json({
      success: true,
      printful_order: result.result
    })

  } catch (error) {
    console.error('Get Printful order error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get Printful order status' },
      { status: 500 }
    )
  }
}
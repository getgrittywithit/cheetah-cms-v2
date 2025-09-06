import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params

    if (!sessionId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Session ID is required' 
      }, { status: 400 })
    }

    // Get order by Stripe session ID
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .single()

    if (error) {
      console.error('Error fetching order:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Order not found' 
      }, { status: 404 })
    }

    if (!order) {
      return NextResponse.json({ 
        success: false, 
        error: 'Order not found' 
      }, { status: 404 })
    }

    // Parse items from JSON if it's stored as JSON
    let items = order.items
    if (typeof items === 'string') {
      try {
        items = JSON.parse(items)
      } catch (e) {
        console.error('Failed to parse order items:', e)
        items = []
      }
    }

    const orderResponse = {
      id: order.id,
      total_amount: order.total_amount,
      currency: order.currency || 'usd',
      customer_email: order.customer_email,
      items: items || [],
      status: order.status
    }

    return NextResponse.json({ 
      success: true, 
      order: orderResponse 
    })
  } catch (error) {
    console.error('Error fetching order details:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order details' },
      { status: 500 }
    )
  }
}
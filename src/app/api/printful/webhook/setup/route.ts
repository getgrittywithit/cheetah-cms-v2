import { NextRequest, NextResponse } from 'next/server'
import { printfulAPI } from '@/lib/printful-api'

// Setup webhook endpoint for Printful
export async function POST(request: NextRequest) {
  try {
    const { webhookUrl } = await request.json()
    
    if (!webhookUrl) {
      return NextResponse.json(
        { success: false, error: 'Webhook URL is required' },
        { status: 400 }
      )
    }

    // Create webhook in Printful
    const webhookData = {
      url: webhookUrl,
      types: [
        'order_created',
        'order_updated', 
        'order_failed',
        'order_shipped',
        'order_canceled',
        'product_updated',
        'product_synced'
      ]
    }

    const response = await fetch('https://api.printful.com/webhooks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PRINTFUL_API_TOKEN}`,
        'Content-Type': 'application/json',
        'X-PF-Store-Id': process.env.PRINTFUL_STORE_ID || ''
      },
      body: JSON.stringify(webhookData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Printful webhook creation error:', errorData)
      return NextResponse.json(
        { success: false, error: `Failed to create webhook: ${errorData.error || response.statusText}` },
        { status: response.status }
      )
    }

    const result = await response.json()
    
    return NextResponse.json({
      success: true,
      webhook: result.result,
      message: 'Webhook created successfully'
    })

  } catch (error) {
    console.error('Webhook setup error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to setup webhook' },
      { status: 500 }
    )
  }
}

// Get existing webhooks
export async function GET() {
  try {
    const response = await fetch('https://api.printful.com/webhooks', {
      headers: {
        'Authorization': `Bearer ${process.env.PRINTFUL_API_TOKEN}`,
        'X-PF-Store-Id': process.env.PRINTFUL_STORE_ID || ''
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Failed to get webhooks:', errorData)
      return NextResponse.json(
        { success: false, error: `Failed to get webhooks: ${errorData.error || response.statusText}` },
        { status: response.status }
      )
    }

    const result = await response.json()
    
    return NextResponse.json({
      success: true,
      webhooks: result.result || [],
      message: 'Webhooks retrieved successfully'
    })

  } catch (error) {
    console.error('Get webhooks error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get webhooks' },
      { status: 500 }
    )
  }
}

// Delete a webhook
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const webhookId = searchParams.get('id')
    
    if (!webhookId) {
      return NextResponse.json(
        { success: false, error: 'Webhook ID is required' },
        { status: 400 }
      )
    }

    const response = await fetch(`https://api.printful.com/webhooks/${webhookId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${process.env.PRINTFUL_API_TOKEN}`,
        'X-PF-Store-Id': process.env.PRINTFUL_STORE_ID || ''
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Failed to delete webhook:', errorData)
      return NextResponse.json(
        { success: false, error: `Failed to delete webhook: ${errorData.error || response.statusText}` },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook deleted successfully'
    })

  } catch (error) {
    console.error('Delete webhook error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete webhook' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getBrandConfig } from '@/lib/brand-config'

const resend = new Resend(process.env.RESEND_API_KEY!)

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

export async function POST(request: NextRequest) {
  try {
    const body: OrderNotification = await request.json()
    
    const { 
      orderId, 
      brandSlug, 
      customerEmail, 
      customerName,
      items, 
      total, 
      currency 
    } = body

    // Get brand configuration for email settings
    const brandConfig = getBrandConfig(brandSlug)
    if (!brandConfig) {
      return NextResponse.json({ error: 'Invalid brand' }, { status: 400 })
    }

    const { emailSettings } = brandConfig
    if (!emailSettings) {
      return NextResponse.json({ error: 'Email not configured for brand' }, { status: 400 })
    }

    // Format total price
    const formattedTotal = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(total / 100)

    // Create order items HTML
    const itemsHtml = items.map(item => {
      const itemPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase(),
      }).format(item.price / 100)
      
      return `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 0; font-weight: 500;">${item.name}</td>
          <td style="padding: 12px 0; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px 0; text-align: right;">${itemPrice}</td>
        </tr>
      `
    }).join('')

    // Send confirmation email
    const { data, error } = await resend.emails.send({
      from: `${emailSettings.fromName} <${emailSettings.fromEmail}>`,
      to: [customerEmail],
      replyTo: emailSettings.replyTo,
      subject: `Order Confirmation - ${brandConfig.name} #${orderId}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Order Confirmation</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <!-- Header -->
            <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid ${brandConfig.theme.primary};">
              <h1 style="color: ${brandConfig.theme.primary}; margin: 0; font-size: 28px;">${brandConfig.name}</h1>
            </div>

            <!-- Success Message -->
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
              <h2 style="color: #16a34a; margin: 0 0 10px 0;">🎉 Payment Successful!</h2>
              <p style="margin: 0; color: #166534;">Thank you for your purchase${customerName ? `, ${customerName}` : ''}!</p>
            </div>

            <!-- Order Details -->
            <div style="margin: 30px 0;">
              <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Order Summary</h3>
              
              <p style="margin: 15px 0;"><strong>Order ID:</strong> #${orderId}</p>
              <p style="margin: 15px 0;"><strong>Email:</strong> ${customerEmail}</p>
              
              <!-- Items Table -->
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                  <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
                    <th style="text-align: left; padding: 12px 0; font-weight: 600;">Item</th>
                    <th style="text-align: center; padding: 12px 0; font-weight: 600;">Qty</th>
                    <th style="text-align: right; padding: 12px 0; font-weight: 600;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr style="border-top: 2px solid #e5e7eb; font-weight: bold;">
                    <td style="padding: 12px 0;">Total</td>
                    <td style="padding: 12px 0;"></td>
                    <td style="padding: 12px 0; text-align: right; color: ${brandConfig.theme.primary}; font-size: 18px;">${formattedTotal}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <!-- Processing Info -->
            <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h4 style="color: #92400e; margin: 0 0 10px 0;">📦 Order Processing</h4>
              <p style="margin: 0; color: #92400e;">Your order is being processed and will be shipped within 3-5 business days. You'll receive shipping updates via email.</p>
            </div>

            <!-- Footer -->
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
              <p>${emailSettings.signature.replace(/\n/g, '<br>')}</p>
              <p style="margin: 10px 0 0 0;">
                Questions? Reply to this email or contact us at <a href="mailto:${emailSettings.replyTo}" style="color: ${brandConfig.theme.primary};">${emailSettings.replyTo}</a>
              </p>
            </div>
          </body>
        </html>
      `
    })

    if (error) {
      console.error('Error sending confirmation email:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    console.log('Order confirmation email sent:', data)
    return NextResponse.json({ success: true, emailId: data?.id })

  } catch (error) {
    console.error('Error processing order notification:', error)
    return NextResponse.json({ error: 'Failed to process order notification' }, { status: 500 })
  }
}
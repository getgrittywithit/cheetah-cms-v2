import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: NextRequest) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY!)
    
    // Test basic email sending
    const { data, error } = await resend.emails.send({
      from: 'hello@resend.dev',
      to: ['levis@gritcollectiveco.com'],
      subject: 'Test Email from Grit CMS',
      html: `
        <h1>Email Test</h1>
        <p>This is a test email to verify Resend configuration.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `
    })

    if (error) {
      console.error('Resend error details:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: error,
        hasApiKey: !!process.env.RESEND_API_KEY
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      emailId: data?.id,
      message: 'Test email sent successfully'
    })
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      hasApiKey: !!process.env.RESEND_API_KEY
    }, { status: 500 })
  }
}
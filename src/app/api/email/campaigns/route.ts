import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendEmail, EmailTemplate, EmailRecipient } from '@/lib/resend-client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brandId = searchParams.get('brandId')
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let query = supabase
      .from('email_campaigns')
      .select(`
        *,
        email_lists (
          name,
          subscribers_count
        )
      `)
      .order('created_at', { ascending: false })

    if (brandId) {
      query = query.eq('brand_id', brandId)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (startDate && endDate) {
      query = query
        .gte('scheduled_for', startDate)
        .lte('scheduled_for', endDate)
    }

    const { data: campaigns, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch email campaigns' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      campaigns: campaigns || []
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      subject, 
      content, 
      listId, 
      type, 
      scheduledFor, 
      brandId 
    } = await request.json()

    if (!subject || !content || !listId || !brandId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Subject, content, list ID, and brand ID are required' 
      }, { status: 400 })
    }

    // Get email list and subscribers
    const { data: emailList, error: listError } = await supabase
      .from('email_lists')
      .select(`
        *,
        email_subscribers (
          email,
          first_name,
          last_name,
          unsubscribed
        )
      `)
      .eq('id', listId)
      .eq('brand_id', brandId)
      .single()

    if (listError || !emailList) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email list not found' 
      }, { status: 404 })
    }

    const activeSubscribers = emailList.email_subscribers.filter(
      (sub: any) => !sub.unsubscribed
    )

    const recipients: EmailRecipient[] = activeSubscribers.map((sub: any) => ({
      email: sub.email,
      name: sub.first_name && sub.last_name ? `${sub.first_name} ${sub.last_name}` : sub.first_name
    }))

    // Save campaign to database
    const campaign = {
      subject,
      content,
      list_id: listId,
      brand_id: brandId,
      status: type === 'now' ? 'sent' : 'scheduled',
      scheduled_for: scheduledFor ? new Date(scheduledFor).toISOString() : null,
      sent_at: type === 'now' ? new Date().toISOString() : null,
      recipients_count: recipients.length,
      created_at: new Date().toISOString()
    }

    const { data: savedCampaign, error: saveError } = await supabase
      .from('email_campaigns')
      .insert([campaign])
      .select()
      .single()

    if (saveError) {
      console.error('Database error:', saveError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to save email campaign' 
      }, { status: 500 })
    }

    // Send email immediately if type is 'now'
    if (type === 'now' && recipients.length > 0) {
      const emailTemplate: EmailTemplate = {
        subject,
        html: content,
        text: content.replace(/<[^>]*>/g, ''), // Strip HTML for text version
        from: `${emailList.from_name || brandId} <${emailList.from_email || 'hello@gritcollective.com'}>`,
        replyTo: emailList.reply_to || 'hello@gritcollective.com'
      }

      const emailResult = await sendEmail(recipients, emailTemplate, {
        tags: [`brand:${brandId}`, `campaign:${savedCampaign.id}`]
      })

      if (!emailResult.success) {
        // Update campaign status to failed
        await supabase
          .from('email_campaigns')
          .update({ status: 'failed', error_message: emailResult.error })
          .eq('id', savedCampaign.id)

        return NextResponse.json({ 
          success: false, 
          error: `Failed to send email: ${emailResult.error}` 
        }, { status: 500 })
      }

      // Update campaign with email ID
      await supabase
        .from('email_campaigns')
        .update({ 
          resend_email_id: emailResult.emailId,
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', savedCampaign.id)
    }

    return NextResponse.json({
      success: true,
      campaign: savedCampaign,
      message: type === 'now' ? 'Email sent successfully' : 'Email scheduled successfully'
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
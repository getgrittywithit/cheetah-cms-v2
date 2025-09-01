import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is required')
}

export const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailTemplate {
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
}

export interface EmailRecipient {
  email: string
  name?: string
}

export const sendEmail = async (
  recipients: EmailRecipient[],
  template: EmailTemplate,
  options?: {
    scheduledFor?: Date
    tags?: string[]
  }
) => {
  try {
    const emailData = {
      from: template.from || 'Grit Collective <hello@gritcollective.com>',
      to: recipients.map(r => r.name ? `${r.name} <${r.email}>` : r.email),
      subject: template.subject,
      html: template.html,
      text: template.text,
      replyTo: template.replyTo,
      tags: options?.tags,
      scheduledAt: options?.scheduledFor?.toISOString()
    }

    const result = await resend.emails.send(emailData)
    
    return {
      success: true,
      emailId: result.data?.id,
      message: 'Email sent successfully'
    }
  } catch (error) {
    console.error('Resend email error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email'
    }
  }
}

export const createEmailList = async (name: string, description?: string) => {
  try {
    const result = await resend.audiences.create({
      name
    })
    
    return {
      success: true,
      listId: result.data?.id,
      message: 'Email list created successfully'
    }
  } catch (error) {
    console.error('Resend list creation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create email list'
    }
  }
}

export const addToEmailList = async (listId: string, contacts: EmailRecipient[]) => {
  try {
    const result = await resend.contacts.create({
      audienceId: listId,
      email: contacts[0].email,
      firstName: contacts[0].name?.split(' ')[0],
      lastName: contacts[0].name?.split(' ').slice(1).join(' '),
      unsubscribed: false
    })
    
    return {
      success: true,
      contactId: result.data?.id,
      message: 'Contact added to list successfully'
    }
  } catch (error) {
    console.error('Resend contact creation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add contact to list'
    }
  }
}
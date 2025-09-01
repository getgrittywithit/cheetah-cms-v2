import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Create email_lists table
    const createEmailListsTable = `
      CREATE TABLE IF NOT EXISTS email_lists (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        brand_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        from_name VARCHAR(255),
        from_email VARCHAR(255),
        reply_to VARCHAR(255),
        subscribers_count INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(brand_id, name)
      );
    `

    // Create email_subscribers table
    const createEmailSubscribersTable = `
      CREATE TABLE IF NOT EXISTS email_subscribers (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        list_id UUID REFERENCES email_lists(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        unsubscribed_at TIMESTAMP WITH TIME ZONE,
        unsubscribed BOOLEAN DEFAULT false,
        source VARCHAR(255),
        tags TEXT[],
        custom_fields JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(list_id, email)
      );
    `

    // Create email_campaigns table (update if exists)
    const createEmailCampaignsTable = `
      CREATE TABLE IF NOT EXISTS email_campaigns (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        brand_id VARCHAR(255) NOT NULL,
        list_id UUID REFERENCES email_lists(id),
        name VARCHAR(255),
        subject VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'draft',
        scheduled_for TIMESTAMP WITH TIME ZONE,
        sent_at TIMESTAMP WITH TIME ZONE,
        recipients_count INTEGER DEFAULT 0,
        opens INTEGER DEFAULT 0,
        clicks INTEGER DEFAULT 0,
        open_rate DECIMAL(5,2),
        click_rate DECIMAL(5,2),
        resend_email_id VARCHAR(255),
        error_message TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `

    // Create email_templates table
    const createEmailTemplatesTable = `
      CREATE TABLE IF NOT EXISTS email_templates (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        brand_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        subject VARCHAR(255),
        html_content TEXT,
        text_content TEXT,
        category VARCHAR(100),
        variables TEXT[],
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(brand_id, name)
      );
    `

    // Create email_events table for tracking
    const createEmailEventsTable = `
      CREATE TABLE IF NOT EXISTS email_events (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
        subscriber_id UUID REFERENCES email_subscribers(id) ON DELETE CASCADE,
        event_type VARCHAR(50) NOT NULL, -- sent, opened, clicked, bounced, unsubscribed
        event_data JSONB,
        occurred_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `

    // Execute all table creations
    const { error: error1 } = await supabase.rpc('exec_sql', { 
      sql: createEmailListsTable 
    })
    if (error1) throw error1

    const { error: error2 } = await supabase.rpc('exec_sql', { 
      sql: createEmailSubscribersTable 
    })
    if (error2) throw error2

    const { error: error3 } = await supabase.rpc('exec_sql', { 
      sql: createEmailCampaignsTable 
    })
    if (error3) throw error3

    const { error: error4 } = await supabase.rpc('exec_sql', { 
      sql: createEmailTemplatesTable 
    })
    if (error4) throw error4

    const { error: error5 } = await supabase.rpc('exec_sql', { 
      sql: createEmailEventsTable 
    })
    if (error5) throw error5

    // Create indexes for performance
    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_email_subscribers_list_id ON email_subscribers(list_id);
      CREATE INDEX IF NOT EXISTS idx_email_subscribers_email ON email_subscribers(email);
      CREATE INDEX IF NOT EXISTS idx_email_campaigns_brand_id ON email_campaigns(brand_id);
      CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
      CREATE INDEX IF NOT EXISTS idx_email_events_campaign_id ON email_events(campaign_id);
      CREATE INDEX IF NOT EXISTS idx_email_events_subscriber_id ON email_events(subscriber_id);
    `

    const { error: indexError } = await supabase.rpc('exec_sql', { 
      sql: createIndexes 
    })
    if (indexError) throw indexError

    // Insert default email lists for each brand
    const brands = ['grit-collective', 'daily-dish-dash']
    
    for (const brandId of brands) {
      const { error: listError } = await supabase
        .from('email_lists')
        .upsert([
          {
            brand_id: brandId,
            name: 'Main Newsletter',
            description: 'Primary newsletter subscriber list',
            subscribers_count: 0
          },
          {
            brand_id: brandId,
            name: 'Product Updates',
            description: 'Subscribers interested in product launches and updates',
            subscribers_count: 0
          },
          {
            brand_id: brandId,
            name: 'VIP Customers',
            description: 'Top customers and repeat buyers',
            subscribers_count: 0
          }
        ], { onConflict: 'brand_id,name' })
      
      if (listError) {
        console.error(`Error creating lists for ${brandId}:`, listError)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Email database tables initialized successfully' 
    })

  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to initialize email database' 
    }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Create blog_posts table
    const createBlogPostsTable = `
      CREATE TABLE IF NOT EXISTS blog_posts (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        brand_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        tags TEXT[],
        status VARCHAR(50) DEFAULT 'draft',
        scheduled_for TIMESTAMP WITH TIME ZONE,
        published_at TIMESTAMP WITH TIME ZONE,
        word_count INTEGER,
        read_time INTEGER,
        views INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `

    // Create indexes for blog_posts
    const createBlogIndexes = `
      CREATE INDEX IF NOT EXISTS idx_blog_posts_brand_id ON blog_posts(brand_id);
      CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
      CREATE INDEX IF NOT EXISTS idx_blog_posts_scheduled_for ON blog_posts(scheduled_for);
    `

    // Create email tables (from init-email route)
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

    // Execute all table creations
    const tables = [
      { name: 'blog_posts', sql: createBlogPostsTable },
      { name: 'blog_indexes', sql: createBlogIndexes },
      { name: 'email_lists', sql: createEmailListsTable },
      { name: 'email_subscribers', sql: createEmailSubscribersTable },
      { name: 'email_campaigns', sql: createEmailCampaignsTable }
    ]

    const results = []
    
    for (const table of tables) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: table.sql })
        if (error) {
          results.push({ table: table.name, status: 'error', error: error.message })
        } else {
          results.push({ table: table.name, status: 'success' })
        }
      } catch (error) {
        results.push({ 
          table: table.name, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    }

    // Insert default email lists for each brand
    const brands = ['grit-collective', 'daily-dish-dash']
    
    for (const brandId of brands) {
      try {
        const { error } = await supabase
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
            }
          ], { onConflict: 'brand_id,name' })
        
        if (error) {
          results.push({ 
            table: `email_lists_${brandId}`, 
            status: 'error', 
            error: error.message 
          })
        } else {
          results.push({ 
            table: `email_lists_${brandId}`, 
            status: 'success' 
          })
        }
      } catch (error) {
        results.push({ 
          table: `email_lists_${brandId}`, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    }

    const hasErrors = results.some(r => r.status === 'error')
    
    return NextResponse.json({ 
      success: !hasErrors,
      message: hasErrors ? 'Some tables failed to create' : 'All tables created successfully',
      results 
    }, { status: hasErrors ? 207 : 200 })

  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to initialize database' 
    }, { status: 500 })
  }
}
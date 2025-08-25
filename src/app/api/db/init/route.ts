import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST() {
  try {
    // Create tables if they don't exist
    const { error: brandsError } = await supabaseAdmin.rpc('create_brand_profiles_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS brand_profiles (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          industry TEXT,
          target_audience TEXT,
          brand_values TEXT[],
          tone_of_voice TEXT,
          brand_personality TEXT[],
          primary_color TEXT,
          secondary_color TEXT,
          accent_color TEXT,
          primary_font TEXT,
          secondary_font TEXT,
          logo_url TEXT,
          tagline TEXT,
          unique_value_proposition TEXT,
          is_default BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    }).catch(() => {
      // Table might already exist
    })

    const { error: socialError } = await supabaseAdmin.rpc('create_social_accounts_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS social_accounts (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id TEXT NOT NULL,
          brand_profile_id UUID REFERENCES brand_profiles(id) ON DELETE CASCADE,
          platform TEXT NOT NULL,
          account_handle TEXT,
          access_token TEXT,
          refresh_token TEXT,
          account_id TEXT,
          is_active BOOLEAN DEFAULT false,
          posting_enabled BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    }).catch(() => {
      // Table might already exist
    })

    const { error: calendarError } = await supabaseAdmin.rpc('create_content_calendar_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS content_calendar (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id TEXT NOT NULL,
          brand_profile_id UUID REFERENCES brand_profiles(id) ON DELETE CASCADE,
          title TEXT,
          content_type TEXT,
          platforms TEXT[],
          scheduled_date TIMESTAMP WITH TIME ZONE,
          status TEXT DEFAULT 'draft',
          content_text TEXT,
          hashtags TEXT[],
          media_urls TEXT[],
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    }).catch(() => {
      // Table might already exist
    })

    // Create the tables using direct SQL since RPC might not exist
    const tables = [
      {
        name: 'brand_profiles',
        sql: `
          CREATE TABLE IF NOT EXISTS brand_profiles (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            industry TEXT,
            target_audience TEXT,
            brand_values TEXT[],
            tone_of_voice TEXT,
            brand_personality TEXT[],
            primary_color TEXT,
            secondary_color TEXT,
            accent_color TEXT,
            primary_font TEXT,
            secondary_font TEXT,
            logo_url TEXT,
            tagline TEXT,
            unique_value_proposition TEXT,
            is_default BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `
      },
      {
        name: 'social_accounts',
        sql: `
          CREATE TABLE IF NOT EXISTS social_accounts (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id TEXT NOT NULL,
            brand_profile_id UUID REFERENCES brand_profiles(id) ON DELETE CASCADE,
            platform TEXT NOT NULL,
            account_handle TEXT,
            access_token TEXT,
            refresh_token TEXT,
            account_id TEXT,
            is_active BOOLEAN DEFAULT false,
            posting_enabled BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `
      },
      {
        name: 'content_calendar',
        sql: `
          CREATE TABLE IF NOT EXISTS content_calendar (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id TEXT NOT NULL,
            brand_profile_id UUID REFERENCES brand_profiles(id) ON DELETE CASCADE,
            title TEXT,
            content_type TEXT,
            platforms TEXT[],
            scheduled_date TIMESTAMP WITH TIME ZONE,
            status TEXT DEFAULT 'draft',
            content_text TEXT,
            hashtags TEXT[],
            media_urls TEXT[],
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `
      },
      {
        name: 'content_analytics',
        sql: `
          CREATE TABLE IF NOT EXISTS content_analytics (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            content_calendar_id UUID REFERENCES content_calendar(id) ON DELETE CASCADE,
            platform TEXT NOT NULL,
            impressions INTEGER DEFAULT 0,
            reach INTEGER DEFAULT 0,
            engagement INTEGER DEFAULT 0,
            clicks INTEGER DEFAULT 0,
            shares INTEGER DEFAULT 0,
            comments INTEGER DEFAULT 0,
            likes INTEGER DEFAULT 0,
            recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `
      }
    ]

    // Try to create tables one by one
    const results = []
    for (const table of tables) {
      try {
        // First check if table exists
        const { data: tableExists, error: checkError } = await supabaseAdmin
          .from(table.name)
          .select('id')
          .limit(1)
        
        if (checkError && checkError.code === '42P01') {
          // Table doesn't exist, we need to create it manually
          results.push({
            table: table.name,
            status: 'error',
            message: 'Table does not exist. Please create it in Supabase dashboard.',
            sql: table.sql
          })
        } else {
          results.push({
            table: table.name,
            status: 'exists',
            message: 'Table already exists'
          })
        }
      } catch (error) {
        results.push({
          table: table.name,
          status: 'error',
          error: error
        })
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: 'Database check completed. Please create any missing tables in your Supabase dashboard using the provided SQL.'
    })
  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize database', details: error },
      { status: 500 }
    )
  }
}
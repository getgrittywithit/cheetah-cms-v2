import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Create ebay_listings table
    const { error: tableError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS ebay_listings (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          brand_profile_id UUID REFERENCES brand_profiles(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          description TEXT,
          price DECIMAL(10,2) NOT NULL DEFAULT 0,
          category TEXT,
          keywords TEXT[] DEFAULT '{}',
          condition TEXT DEFAULT 'Used',
          status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'optimized', 'published')),
          ebay_url TEXT,
          ebay_item_id TEXT,
          views INTEGER DEFAULT 0,
          watchers INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS ebay_listings_brand_profile_id_idx ON ebay_listings(brand_profile_id);
        CREATE INDEX IF NOT EXISTS ebay_listings_status_idx ON ebay_listings(status);
        CREATE INDEX IF NOT EXISTS ebay_listings_created_at_idx ON ebay_listings(created_at);

        -- Create updated_at trigger
        CREATE OR REPLACE FUNCTION update_ebay_listings_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS update_ebay_listings_updated_at ON ebay_listings;
        CREATE TRIGGER update_ebay_listings_updated_at
          BEFORE UPDATE ON ebay_listings
          FOR EACH ROW
          EXECUTE FUNCTION update_ebay_listings_updated_at();
      `
    })

    if (tableError) {
      console.error('Error creating ebay_listings table:', tableError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create ebay_listings table',
        details: tableError.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'eBay listings table created successfully' 
    })

  } catch (error) {
    console.error('Error initializing eBay database:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to initialize eBay database' 
    }, { status: 500 })
  }
}
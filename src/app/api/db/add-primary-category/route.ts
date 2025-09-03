import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST() {
  try {
    // Check if primary_category_id column exists in products table
    const { data: columnExists } = await supabaseAdmin
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'products')
      .eq('column_name', 'primary_category_id')
      .single()

    if (!columnExists) {
      console.log('Adding primary_category_id column to products table...')
      
      // Add the column using a raw SQL query through a stored procedure
      const { error: alterError } = await supabaseAdmin
        .rpc('sql', {
          query: `
            ALTER TABLE products 
            ADD COLUMN primary_category_id UUID REFERENCES categories(id) ON DELETE SET NULL;
            
            CREATE INDEX IF NOT EXISTS idx_products_primary_category 
            ON products(primary_category_id);
          `
        })

      if (alterError) {
        console.error('Error adding column:', alterError)
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to add primary_category_id column',
          details: alterError.message 
        }, { status: 500 })
      }

      console.log('Successfully added primary_category_id column')
    } else {
      console.log('primary_category_id column already exists')
    }

    return NextResponse.json({ 
      success: true, 
      message: 'primary_category_id column is ready' 
    })
  } catch (error) {
    console.error('Error checking/adding column:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to add primary_category_id column' 
    }, { status: 500 })
  }
}
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST() {
  try {
    // Add product_type to products table if it doesn't exist
    const { error: productTypeError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN 
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'products' AND column_name = 'product_type'
          ) THEN
            ALTER TABLE products ADD COLUMN product_type TEXT DEFAULT 'handmade';
          END IF;
        END $$;
      `
    })

    if (productTypeError) {
      console.error('Error adding product_type column:', productTypeError)
    }

    // Create categories table
    const { error: categoriesTableError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS categories (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL,
          slug TEXT NOT NULL,
          description TEXT,
          parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
          brand_profile_id UUID REFERENCES brand_profiles(id) ON DELETE CASCADE,
          sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(slug, brand_profile_id)
        );

        -- Create index for faster queries
        CREATE INDEX IF NOT EXISTS idx_categories_brand ON categories(brand_profile_id);
        CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
        CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
      `
    })

    if (categoriesTableError) {
      console.error('Error creating categories table:', categoriesTableError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create categories table',
        details: categoriesTableError.message 
      }, { status: 500 })
    }

    // Create product_categories junction table for many-to-many relationship
    const { error: junctionTableError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS product_categories (
          product_id UUID REFERENCES products(id) ON DELETE CASCADE,
          category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
          PRIMARY KEY (product_id, category_id)
        );

        -- Create indexes for faster queries
        CREATE INDEX IF NOT EXISTS idx_product_categories_product ON product_categories(product_id);
        CREATE INDEX IF NOT EXISTS idx_product_categories_category ON product_categories(category_id);
      `
    })

    if (junctionTableError) {
      console.error('Error creating product_categories table:', junctionTableError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create product_categories table',
        details: junctionTableError.message 
      }, { status: 500 })
    }

    // Add primary_category_id to products table
    const { error: primaryCategoryError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN 
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'products' AND column_name = 'primary_category_id'
          ) THEN
            ALTER TABLE products ADD COLUMN primary_category_id UUID REFERENCES categories(id) ON DELETE SET NULL;
            CREATE INDEX idx_products_primary_category ON products(primary_category_id);
          END IF;
        END $$;
      `
    })

    if (primaryCategoryError) {
      console.error('Error adding primary_category_id column:', primaryCategoryError)
    }

    // Insert default categories for each brand
    const { data: brands } = await supabaseAdmin
      .from('brand_profiles')
      .select('id, slug')

    if (brands) {
      for (const brand of brands) {
        // Check if categories already exist for this brand
        const { data: existingCategories } = await supabaseAdmin
          .from('categories')
          .select('id')
          .eq('brand_profile_id', brand.id)
          .limit(1)

        if (!existingCategories || existingCategories.length === 0) {
          // Insert default categories
          const defaultCategories = [
            { name: 'Candles & Wax Melts', slug: 'candles-wax-melts', sort_order: 1 },
            { name: 'Wall Art', slug: 'wall-art', sort_order: 2 },
            { name: 'Apparel', slug: 'apparel', sort_order: 3 },
            { name: 'Home Decor', slug: 'home-decor', sort_order: 4 },
            { name: 'Accessories', slug: 'accessories', sort_order: 5 },
            { name: 'Stationery', slug: 'stationery', sort_order: 6 },
            { name: 'Digital Downloads', slug: 'digital-downloads', sort_order: 7 }
          ]

          const categoriesToInsert = defaultCategories.map(cat => ({
            ...cat,
            brand_profile_id: brand.id
          }))

          await supabaseAdmin
            .from('categories')
            .insert(categoriesToInsert)
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Categories system initialized successfully' 
    })
  } catch (error) {
    console.error('Error initializing categories:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to initialize categories system' 
    }, { status: 500 })
  }
}
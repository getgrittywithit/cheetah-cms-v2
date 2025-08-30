import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('Starting e-commerce database initialization...')

    // Create products table
    const createProductsTable = `
      CREATE TABLE IF NOT EXISTS public.products (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL,
        brand_profile_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        short_description TEXT,
        slug TEXT NOT NULL,
        sku TEXT,
        price DECIMAL(10,2) NOT NULL,
        compare_at_price DECIMAL(10,2),
        cost_per_item DECIMAL(10,2),
        track_inventory BOOLEAN DEFAULT true,
        continue_selling_when_out_of_stock BOOLEAN DEFAULT false,
        quantity INTEGER,
        weight DECIMAL(10,2),
        weight_unit TEXT DEFAULT 'lb',
        requires_shipping BOOLEAN DEFAULT true,
        is_physical BOOLEAN DEFAULT true,
        status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
        visibility TEXT DEFAULT 'visible' CHECK (visibility IN ('visible', 'hidden')),
        vendor TEXT,
        product_type TEXT,
        tags TEXT[],
        images TEXT[],
        featured_image TEXT,
        seo_title TEXT,
        seo_description TEXT,
        handle TEXT,
        template_suffix TEXT,
        published_at TIMESTAMP WITH TIME ZONE,
        shopify_product_id TEXT,
        printful_sync_product_id TEXT,
        etsy_listing_id TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    // Create product_variants table
    const createProductVariantsTable = `
      CREATE TABLE IF NOT EXISTS public.product_variants (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        compare_at_price DECIMAL(10,2),
        sku TEXT,
        position INTEGER DEFAULT 1,
        inventory_policy TEXT DEFAULT 'deny' CHECK (inventory_policy IN ('deny', 'continue')),
        fulfillment_service TEXT,
        inventory_management TEXT,
        option1 TEXT,
        option2 TEXT,
        option3 TEXT,
        taxable BOOLEAN DEFAULT true,
        barcode TEXT,
        grams INTEGER,
        image_id TEXT,
        weight DECIMAL(10,2),
        weight_unit TEXT DEFAULT 'lb',
        inventory_item_id TEXT,
        inventory_quantity INTEGER,
        old_inventory_quantity INTEGER,
        requires_shipping BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    // Create orders table
    const createOrdersTable = `
      CREATE TABLE IF NOT EXISTS public.orders (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL,
        brand_profile_id TEXT NOT NULL,
        order_number TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL,
        phone TEXT,
        customer_name TEXT NOT NULL,
        financial_status TEXT DEFAULT 'pending' CHECK (financial_status IN ('pending', 'authorized', 'partially_paid', 'paid', 'partially_refunded', 'refunded', 'voided')),
        fulfillment_status TEXT DEFAULT 'null' CHECK (fulfillment_status IN ('fulfilled', 'null', 'partial', 'restocked')),
        currency TEXT DEFAULT 'USD',
        total_price DECIMAL(10,2) NOT NULL,
        subtotal_price DECIMAL(10,2) NOT NULL,
        total_tax DECIMAL(10,2) DEFAULT 0,
        shipping_cost DECIMAL(10,2) DEFAULT 0,
        discount_amount DECIMAL(10,2) DEFAULT 0,
        payment_method TEXT,
        billing_address JSONB,
        shipping_address JSONB,
        line_items JSONB NOT NULL,
        notes TEXT,
        tags TEXT[],
        processed_at TIMESTAMP WITH TIME ZONE,
        cancelled_at TIMESTAMP WITH TIME ZONE,
        cancel_reason TEXT,
        shopify_order_id TEXT,
        stripe_payment_intent_id TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    // Create customers table
    const createCustomersTable = `
      CREATE TABLE IF NOT EXISTS public.customers (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL,
        brand_profile_id TEXT NOT NULL,
        email TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        phone TEXT,
        accepts_marketing BOOLEAN DEFAULT false,
        total_spent DECIMAL(10,2) DEFAULT 0,
        order_count INTEGER DEFAULT 0,
        last_order_id UUID,
        last_order_date TIMESTAMP WITH TIME ZONE,
        default_address JSONB,
        addresses JSONB[],
        tags TEXT[],
        note TEXT,
        state TEXT DEFAULT 'enabled' CHECK (state IN ('enabled', 'disabled', 'invited', 'declined')),
        verified_email BOOLEAN DEFAULT false,
        shopify_customer_id TEXT,
        stripe_customer_id TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    // Create indexes
    const createIndexes = `
      CREATE INDEX IF NOT EXISTS products_brand_profile_id_idx ON public.products(brand_profile_id);
      CREATE INDEX IF NOT EXISTS products_status_idx ON public.products(status);
      CREATE INDEX IF NOT EXISTS products_slug_idx ON public.products(slug);
      CREATE INDEX IF NOT EXISTS products_created_at_idx ON public.products(created_at);
      CREATE INDEX IF NOT EXISTS product_variants_product_id_idx ON public.product_variants(product_id);
      CREATE INDEX IF NOT EXISTS orders_brand_profile_id_idx ON public.orders(brand_profile_id);
      CREATE INDEX IF NOT EXISTS orders_email_idx ON public.orders(email);
      CREATE INDEX IF NOT EXISTS orders_order_number_idx ON public.orders(order_number);
      CREATE INDEX IF NOT EXISTS customers_brand_profile_id_idx ON public.customers(brand_profile_id);
      CREATE INDEX IF NOT EXISTS customers_email_idx ON public.customers(email);
    `

    // Execute table creation
    console.log('Creating products table...')
    const { error: productsError } = await supabaseAdmin.rpc('exec', { sql: createProductsTable })
    if (productsError) throw productsError

    console.log('Creating product_variants table...')
    const { error: variantsError } = await supabaseAdmin.rpc('exec', { sql: createProductVariantsTable })
    if (variantsError) throw variantsError

    console.log('Creating orders table...')
    const { error: ordersError } = await supabaseAdmin.rpc('exec', { sql: createOrdersTable })
    if (ordersError) throw ordersError

    console.log('Creating customers table...')
    const { error: customersError } = await supabaseAdmin.rpc('exec', { sql: createCustomersTable })
    if (customersError) throw customersError

    console.log('Creating indexes...')
    const { error: indexesError } = await supabaseAdmin.rpc('exec', { sql: createIndexes })
    if (indexesError) throw indexesError

    // Enable Row Level Security
    const enableRLS = `
      ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

      -- Products policies
      CREATE POLICY IF NOT EXISTS "Users can view their own products" ON public.products
        FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can insert their own products" ON public.products
        FOR INSERT WITH CHECK (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can update their own products" ON public.products
        FOR UPDATE USING (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can delete their own products" ON public.products
        FOR DELETE USING (auth.uid() = user_id);

      -- Product variants policies
      CREATE POLICY IF NOT EXISTS "Users can view variants of their products" ON public.product_variants
        FOR SELECT USING (EXISTS (SELECT 1 FROM public.products WHERE products.id = product_variants.product_id AND products.user_id = auth.uid()));
      CREATE POLICY IF NOT EXISTS "Users can insert variants for their products" ON public.product_variants
        FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.products WHERE products.id = product_variants.product_id AND products.user_id = auth.uid()));
      CREATE POLICY IF NOT EXISTS "Users can update variants of their products" ON public.product_variants
        FOR UPDATE USING (EXISTS (SELECT 1 FROM public.products WHERE products.id = product_variants.product_id AND products.user_id = auth.uid()));
      CREATE POLICY IF NOT EXISTS "Users can delete variants of their products" ON public.product_variants
        FOR DELETE USING (EXISTS (SELECT 1 FROM public.products WHERE products.id = product_variants.product_id AND products.user_id = auth.uid()));

      -- Orders policies
      CREATE POLICY IF NOT EXISTS "Users can view their own orders" ON public.orders
        FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can insert their own orders" ON public.orders
        FOR INSERT WITH CHECK (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can update their own orders" ON public.orders
        FOR UPDATE USING (auth.uid() = user_id);

      -- Customers policies
      CREATE POLICY IF NOT EXISTS "Users can view their own customers" ON public.customers
        FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can insert their own customers" ON public.customers
        FOR INSERT WITH CHECK (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can update their own customers" ON public.customers
        FOR UPDATE USING (auth.uid() = user_id);
    `

    console.log('Enabling Row Level Security...')
    const { error: rlsError } = await supabaseAdmin.rpc('exec', { sql: enableRLS })
    if (rlsError) throw rlsError

    return NextResponse.json({
      success: true,
      message: 'E-commerce database tables created successfully',
      tables: ['products', 'product_variants', 'orders', 'customers'],
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error initializing e-commerce database:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to initialize e-commerce database',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
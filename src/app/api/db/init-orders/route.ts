import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST() {
  try {
    // Create orders table
    const { error: ordersTableError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS orders (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          brand_profile_id UUID REFERENCES brand_profiles(id) ON DELETE CASCADE,
          stripe_session_id TEXT UNIQUE,
          stripe_payment_intent_id TEXT,
          customer_email TEXT,
          customer_name TEXT,
          customer_phone TEXT,
          billing_address JSONB,
          shipping_address JSONB,
          total_amount DECIMAL(10, 2) NOT NULL,
          currency TEXT DEFAULT 'usd',
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled', 'refunded', 'fulfilled')),
          payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
          fulfillment_status TEXT DEFAULT 'pending' CHECK (fulfillment_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
          items JSONB NOT NULL,
          metadata JSONB,
          notes TEXT,
          paid_at TIMESTAMP,
          fulfilled_at TIMESTAMP,
          failure_reason TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_orders_brand ON orders(brand_profile_id);
        CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
        CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
        CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON orders(stripe_session_id);
        CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent ON orders(stripe_payment_intent_id);
        CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

        -- Create updated_at trigger
        CREATE OR REPLACE FUNCTION update_orders_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS trigger_orders_updated_at ON orders;
        CREATE TRIGGER trigger_orders_updated_at
          BEFORE UPDATE ON orders
          FOR EACH ROW EXECUTE FUNCTION update_orders_updated_at();
      `
    })

    if (ordersTableError) {
      console.error('Error creating orders table:', ordersTableError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create orders table',
        details: ordersTableError.message 
      }, { status: 500 })
    }

    // Create order_items table for detailed line items
    const { error: orderItemsError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS order_items (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
          product_id UUID REFERENCES products(id) ON DELETE SET NULL,
          product_name TEXT NOT NULL,
          product_type TEXT,
          price DECIMAL(10, 2) NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 1,
          total_amount DECIMAL(10, 2) GENERATED ALWAYS AS (price * quantity) STORED,
          product_data JSONB, -- Snapshot of product at time of order
          created_at TIMESTAMP DEFAULT NOW()
        );

        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
        CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
      `
    })

    if (orderItemsError) {
      console.error('Error creating order_items table:', orderItemsError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create order_items table',
        details: orderItemsError.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Orders system initialized successfully' 
    })
  } catch (error) {
    console.error('Error initializing orders system:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to initialize orders system' 
    }, { status: 500 })
  }
}
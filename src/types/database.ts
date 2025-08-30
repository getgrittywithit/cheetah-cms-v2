export type Database = {
  public: {
    Tables: {
      brand_profiles: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          industry: string | null
          target_audience: string | null
          brand_values: string[] | null
          tone_of_voice: string | null
          brand_personality: string[] | null
          primary_color: string | null
          secondary_color: string | null
          accent_color: string | null
          primary_font: string | null
          secondary_font: string | null
          logo_url: string | null
          tagline: string | null
          unique_value_proposition: string | null
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          industry?: string | null
          target_audience?: string | null
          brand_values?: string[] | null
          tone_of_voice?: string | null
          brand_personality?: string[] | null
          primary_color?: string | null
          secondary_color?: string | null
          accent_color?: string | null
          primary_font?: string | null
          secondary_font?: string | null
          logo_url?: string | null
          tagline?: string | null
          unique_value_proposition?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          industry?: string | null
          target_audience?: string | null
          brand_values?: string[] | null
          tone_of_voice?: string | null
          brand_personality?: string[] | null
          primary_color?: string | null
          secondary_color?: string | null
          accent_color?: string | null
          primary_font?: string | null
          secondary_font?: string | null
          logo_url?: string | null
          tagline?: string | null
          unique_value_proposition?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      social_accounts: {
        Row: {
          id: string
          user_id: string
          brand_profile_id: string
          platform: string
          account_handle: string
          access_token: string | null
          account_id: string | null
          is_active: boolean
          posting_enabled: boolean
          last_sync: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          brand_profile_id: string
          platform: string
          account_handle: string
          access_token?: string | null
          account_id?: string | null
          is_active?: boolean
          posting_enabled?: boolean
          last_sync?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          brand_profile_id?: string
          platform?: string
          account_handle?: string
          access_token?: string | null
          account_id?: string | null
          is_active?: boolean
          posting_enabled?: boolean
          last_sync?: string | null
          created_at?: string
        }
      }
      content_calendar: {
        Row: {
          id: string
          user_id: string
          brand_profile_id: string
          title: string
          content_type: 'post' | 'story' | 'video' | 'carousel' | 'reel'
          platforms: string[]
          scheduled_date: string
          status: 'draft' | 'scheduled' | 'published' | 'failed'
          content_text: string | null
          hashtags: string[] | null
          media_urls: string[] | null
          ai_assistant_used: string | null
          engagement_prediction: Record<string, unknown> | null
          actual_performance: Record<string, unknown> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          brand_profile_id: string
          title: string
          content_type: 'post' | 'story' | 'video' | 'carousel' | 'reel'
          platforms: string[]
          scheduled_date: string
          status?: 'draft' | 'scheduled' | 'published' | 'failed'
          content_text?: string | null
          hashtags?: string[] | null
          media_urls?: string[] | null
          ai_assistant_used?: string | null
          engagement_prediction?: Record<string, unknown> | null
          actual_performance?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          brand_profile_id?: string
          title?: string
          content_type?: 'post' | 'story' | 'video' | 'carousel' | 'reel'
          platforms?: string[]
          scheduled_date?: string
          status?: 'draft' | 'scheduled' | 'published' | 'failed'
          content_text?: string | null
          hashtags?: string[] | null
          media_urls?: string[] | null
          ai_assistant_used?: string | null
          engagement_prediction?: Record<string, unknown> | null
          actual_performance?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string
        }
      }
      content_analytics: {
        Row: {
          id: string
          content_calendar_id: string
          platform: string
          post_id: string | null
          impressions: number
          reach: number
          engagement_count: number
          likes_count: number
          comments_count: number
          shares_count: number
          clicks_count: number
          engagement_rate: number | null
          last_updated: string
        }
        Insert: {
          id?: string
          content_calendar_id: string
          platform: string
          post_id?: string | null
          impressions?: number
          reach?: number
          engagement_count?: number
          likes_count?: number
          comments_count?: number
          shares_count?: number
          clicks_count?: number
          engagement_rate?: number | null
          last_updated?: string
        }
        Update: {
          id?: string
          content_calendar_id?: string
          platform?: string
          post_id?: string | null
          impressions?: number
          reach?: number
          engagement_count?: number
          likes_count?: number
          comments_count?: number
          shares_count?: number
          clicks_count?: number
          engagement_rate?: number | null
          last_updated?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          user_id: string
          brand_profile_id: string
          name: string
          description: string | null
          short_description: string | null
          slug: string
          sku: string | null
          price: number
          compare_at_price: number | null
          cost_per_item: number | null
          track_inventory: boolean
          continue_selling_when_out_of_stock: boolean
          quantity: number | null
          weight: number | null
          weight_unit: string | null
          requires_shipping: boolean
          is_physical: boolean
          status: 'draft' | 'active' | 'archived'
          visibility: 'visible' | 'hidden'
          vendor: string | null
          product_type: string | null
          tags: string[] | null
          images: string[] | null
          featured_image: string | null
          seo_title: string | null
          seo_description: string | null
          handle: string | null
          template_suffix: string | null
          published_at: string | null
          created_at: string
          updated_at: string
          shopify_product_id: string | null
          printful_sync_product_id: string | null
          etsy_listing_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          brand_profile_id: string
          name: string
          description?: string | null
          short_description?: string | null
          slug: string
          sku?: string | null
          price: number
          compare_at_price?: number | null
          cost_per_item?: number | null
          track_inventory?: boolean
          continue_selling_when_out_of_stock?: boolean
          quantity?: number | null
          weight?: number | null
          weight_unit?: string | null
          requires_shipping?: boolean
          is_physical?: boolean
          status?: 'draft' | 'active' | 'archived'
          visibility?: 'visible' | 'hidden'
          vendor?: string | null
          product_type?: string | null
          tags?: string[] | null
          images?: string[] | null
          featured_image?: string | null
          seo_title?: string | null
          seo_description?: string | null
          handle?: string | null
          template_suffix?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
          shopify_product_id?: string | null
          printful_sync_product_id?: string | null
          etsy_listing_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          brand_profile_id?: string
          name?: string
          description?: string | null
          short_description?: string | null
          slug?: string
          sku?: string | null
          price?: number
          compare_at_price?: number | null
          cost_per_item?: number | null
          track_inventory?: boolean
          continue_selling_when_out_of_stock?: boolean
          quantity?: number | null
          weight?: number | null
          weight_unit?: string | null
          requires_shipping?: boolean
          is_physical?: boolean
          status?: 'draft' | 'active' | 'archived'
          visibility?: 'visible' | 'hidden'
          vendor?: string | null
          product_type?: string | null
          tags?: string[] | null
          images?: string[] | null
          featured_image?: string | null
          seo_title?: string | null
          seo_description?: string | null
          handle?: string | null
          template_suffix?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
          shopify_product_id?: string | null
          printful_sync_product_id?: string | null
          etsy_listing_id?: string | null
        }
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          title: string
          price: number
          compare_at_price: number | null
          sku: string | null
          position: number
          inventory_policy: 'deny' | 'continue'
          fulfillment_service: string | null
          inventory_management: string | null
          option1: string | null
          option2: string | null
          option3: string | null
          taxable: boolean
          barcode: string | null
          grams: number | null
          image_id: string | null
          weight: number | null
          weight_unit: string | null
          inventory_item_id: string | null
          inventory_quantity: number | null
          old_inventory_quantity: number | null
          requires_shipping: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          title: string
          price: number
          compare_at_price?: number | null
          sku?: string | null
          position?: number
          inventory_policy?: 'deny' | 'continue'
          fulfillment_service?: string | null
          inventory_management?: string | null
          option1?: string | null
          option2?: string | null
          option3?: string | null
          taxable?: boolean
          barcode?: string | null
          grams?: number | null
          image_id?: string | null
          weight?: number | null
          weight_unit?: string | null
          inventory_item_id?: string | null
          inventory_quantity?: number | null
          old_inventory_quantity?: number | null
          requires_shipping?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          title?: string
          price?: number
          compare_at_price?: number | null
          sku?: string | null
          position?: number
          inventory_policy?: 'deny' | 'continue'
          fulfillment_service?: string | null
          inventory_management?: string | null
          option1?: string | null
          option2?: string | null
          option3?: string | null
          taxable?: boolean
          barcode?: string | null
          grams?: number | null
          image_id?: string | null
          weight?: number | null
          weight_unit?: string | null
          inventory_item_id?: string | null
          inventory_quantity?: number | null
          old_inventory_quantity?: number | null
          requires_shipping?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          brand_profile_id: string
          order_number: string
          email: string
          phone: string | null
          customer_name: string
          financial_status: 'pending' | 'authorized' | 'partially_paid' | 'paid' | 'partially_refunded' | 'refunded' | 'voided'
          fulfillment_status: 'fulfilled' | 'null' | 'partial' | 'restocked'
          currency: string
          total_price: number
          subtotal_price: number
          total_tax: number
          shipping_cost: number
          discount_amount: number
          payment_method: string | null
          billing_address: Record<string, unknown> | null
          shipping_address: Record<string, unknown> | null
          line_items: Record<string, unknown>[]
          notes: string | null
          tags: string[] | null
          processed_at: string | null
          cancelled_at: string | null
          cancel_reason: string | null
          shopify_order_id: string | null
          stripe_payment_intent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          brand_profile_id: string
          order_number: string
          email: string
          phone?: string | null
          customer_name: string
          financial_status?: 'pending' | 'authorized' | 'partially_paid' | 'paid' | 'partially_refunded' | 'refunded' | 'voided'
          fulfillment_status?: 'fulfilled' | 'null' | 'partial' | 'restocked'
          currency?: string
          total_price: number
          subtotal_price: number
          total_tax: number
          shipping_cost: number
          discount_amount?: number
          payment_method?: string | null
          billing_address?: Record<string, unknown> | null
          shipping_address?: Record<string, unknown> | null
          line_items: Record<string, unknown>[]
          notes?: string | null
          tags?: string[] | null
          processed_at?: string | null
          cancelled_at?: string | null
          cancel_reason?: string | null
          shopify_order_id?: string | null
          stripe_payment_intent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          brand_profile_id?: string
          order_number?: string
          email?: string
          phone?: string | null
          customer_name?: string
          financial_status?: 'pending' | 'authorized' | 'partially_paid' | 'paid' | 'partially_refunded' | 'refunded' | 'voided'
          fulfillment_status?: 'fulfilled' | 'null' | 'partial' | 'restocked'
          currency?: string
          total_price?: number
          subtotal_price?: number
          total_tax?: number
          shipping_cost?: number
          discount_amount?: number
          payment_method?: string | null
          billing_address?: Record<string, unknown> | null
          shipping_address?: Record<string, unknown> | null
          line_items?: Record<string, unknown>[]
          notes?: string | null
          tags?: string[] | null
          processed_at?: string | null
          cancelled_at?: string | null
          cancel_reason?: string | null
          shopify_order_id?: string | null
          stripe_payment_intent_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          user_id: string
          brand_profile_id: string
          email: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          accepts_marketing: boolean
          total_spent: number
          order_count: number
          last_order_id: string | null
          last_order_date: string | null
          default_address: Record<string, unknown> | null
          addresses: Record<string, unknown>[] | null
          tags: string[] | null
          note: string | null
          state: 'enabled' | 'disabled' | 'invited' | 'declined'
          verified_email: boolean
          shopify_customer_id: string | null
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          brand_profile_id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          accepts_marketing?: boolean
          total_spent?: number
          order_count?: number
          last_order_id?: string | null
          last_order_date?: string | null
          default_address?: Record<string, unknown> | null
          addresses?: Record<string, unknown>[] | null
          tags?: string[] | null
          note?: string | null
          state?: 'enabled' | 'disabled' | 'invited' | 'declined'
          verified_email?: boolean
          shopify_customer_id?: string | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          brand_profile_id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          accepts_marketing?: boolean
          total_spent?: number
          order_count?: number
          last_order_id?: string | null
          last_order_date?: string | null
          default_address?: Record<string, unknown> | null
          addresses?: Record<string, unknown>[] | null
          tags?: string[] | null
          note?: string | null
          state?: 'enabled' | 'disabled' | 'invited' | 'declined'
          verified_email?: boolean
          shopify_customer_id?: string | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
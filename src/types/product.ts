import { Database } from './database'

export type Product = Database['public']['Tables']['products']['Row']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type ProductUpdate = Database['public']['Tables']['products']['Update']

export type ProductVariant = Database['public']['Tables']['product_variants']['Row']
export type ProductVariantInsert = Database['public']['Tables']['product_variants']['Insert']
export type ProductVariantUpdate = Database['public']['Tables']['product_variants']['Update']

export type Order = Database['public']['Tables']['orders']['Row']
export type OrderInsert = Database['public']['Tables']['orders']['Insert']
export type OrderUpdate = Database['public']['Tables']['orders']['Update']

export type Customer = Database['public']['Tables']['customers']['Row']
export type CustomerInsert = Database['public']['Tables']['customers']['Insert']
export type CustomerUpdate = Database['public']['Tables']['customers']['Update']

// Extended types for UI components
export interface ProductWithVariants extends Product {
  variants?: ProductVariant[]
}

export interface ProductFormData {
  name: string
  description?: string
  short_description?: string
  price: number
  compare_at_price?: number
  cost_per_item?: number
  sku?: string
  track_inventory: boolean
  quantity?: number
  weight?: number
  weight_unit?: 'lb' | 'kg' | 'g' | 'oz'
  requires_shipping: boolean
  is_physical: boolean
  product_type?: string
  vendor?: string
  tags: string[]
  images: string[]
  featured_image?: string
  status: 'draft' | 'active' | 'archived'
  visibility: 'visible' | 'hidden'
  seo_title?: string
  seo_description?: string
}

export interface OrderLineItem {
  id: string
  variant_id: string
  product_id: string
  title: string
  variant_title?: string
  sku?: string
  quantity: number
  price: number
  total_discount: number
  fulfillment_service: string
  fulfillment_status?: string
  requires_shipping: boolean
  taxable: boolean
  gift_card: boolean
  name: string
  variant_inventory_management?: string
  properties: Record<string, any>[]
  product_exists: boolean
  fulfillable_quantity: number
  grams: number
  image?: string
}

// Shopify sync status
export interface ProductSyncStatus {
  shopify: 'synced' | 'pending' | 'error' | 'not_synced'
  printful: 'synced' | 'pending' | 'error' | 'not_synced'
  etsy: 'synced' | 'pending' | 'error' | 'not_synced'
}

// Analytics types
export interface ProductAnalytics {
  views: number
  sales: number
  revenue: number
  conversion_rate: number
  inventory_remaining?: number
  last_sale_date?: string
}

export interface ProductStats {
  total_products: number
  active_products: number
  draft_products: number
  archived_products: number
  total_variants: number
  low_stock_count: number
}
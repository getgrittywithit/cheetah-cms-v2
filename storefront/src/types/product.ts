// Product types for storefront (simplified from CMS types)
export interface Product {
  id: string
  name: string
  description: string | null
  short_description: string | null
  slug: string
  sku: string | null
  price: number
  compare_at_price: number | null
  images: string[]
  featured_image: string | null
  tags: string[] | null
  status: 'draft' | 'active' | 'archived'
  brand: string
  product_type: string | null
  weight?: number
  weight_unit?: string
  requires_shipping: boolean
  variants?: ProductVariant[]
}

export interface ProductVariant {
  id: string
  title: string
  price: number
  compare_at_price: number | null
  sku: string | null
  inventory_quantity: number | null
  option1: string | null
  option2: string | null
  option3: string | null
  requires_shipping: boolean
}

export interface CartItem {
  id: string
  productId: string
  variantId?: string
  name: string
  image: string
  price: number
  quantity: number
  sku?: string
}

export interface Cart {
  items: CartItem[]
  total: number
  subtotal: number
  tax: number
  shipping: number
}

export interface Brand {
  id: string
  name: string
  slug: string
  description: string
  theme: {
    primary: string
    secondary: string
    accent?: string
  }
  domain?: string
}

export interface ShippingAddress {
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  state: string
  zip: string
  country: string
  phone?: string
}

export interface Customer {
  email: string
  firstName: string
  lastName: string
  phone?: string
  acceptsMarketing: boolean
}

export interface CheckoutData {
  customer: Customer
  shippingAddress: ShippingAddress
  billingAddress?: ShippingAddress
  paymentMethod: string
  cart: Cart
}
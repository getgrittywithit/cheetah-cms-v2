const SHOPIFY_STORE_URL = 'https://grit-colllective.myshopify.com' // Update based on your store
const SHOPIFY_API_VERSION = '2025-07'

export interface ShopifyProduct {
  id?: number
  title: string
  body_html: string
  vendor: string
  product_type: string
  handle?: string
  status?: 'active' | 'draft' | 'archived'
  tags: string
  variants: ShopifyVariant[]
  images: ShopifyImage[]
  options?: ShopifyOption[]
  seo_title?: string
  seo_description?: string
}

export interface ShopifyVariant {
  id?: number
  product_id?: number
  title: string
  price: string
  sku: string
  inventory_quantity?: number
  weight?: number
  weight_unit?: string
  requires_shipping?: boolean
  taxable?: boolean
  inventory_management?: string
  inventory_policy?: 'deny' | 'continue'
}

export interface ShopifyImage {
  id?: number
  product_id?: number
  src: string
  alt?: string
  position?: number
  variant_ids?: number[]
}

export interface ShopifyOption {
  name: string
  values: string[]
}

class ShopifyAPI {
  private storeUrl: string
  private accessToken: string
  private apiVersion: string

  constructor() {
    this.storeUrl = SHOPIFY_STORE_URL
    this.accessToken = process.env.SHOPIFY_ACCESS_TOKEN || ''
    this.apiVersion = SHOPIFY_API_VERSION

    if (!this.accessToken) {
      throw new Error('SHOPIFY_ACCESS_TOKEN is required')
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.storeUrl}/admin/api/${this.apiVersion}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Shopify API Error: ${response.status} - ${errorData.errors || response.statusText}`)
    }

    const data = await response.json()
    return data
  }

  // Create a new product
  async createProduct(productData: ShopifyProduct): Promise<ShopifyProduct> {
    try {
      const response = await this.makeRequest('/products.json', {
        method: 'POST',
        body: JSON.stringify({ product: productData })
      })
      return response.product
    } catch (error) {
      console.error('Failed to create Shopify product:', error)
      throw error
    }
  }

  // Get product by ID
  async getProduct(productId: number): Promise<ShopifyProduct> {
    try {
      const response = await this.makeRequest(`/products/${productId}.json`)
      return response.product
    } catch (error) {
      console.error(`Failed to get Shopify product ${productId}:`, error)
      throw error
    }
  }

  // Update product
  async updateProduct(productId: number, productData: Partial<ShopifyProduct>): Promise<ShopifyProduct> {
    try {
      const response = await this.makeRequest(`/products/${productId}.json`, {
        method: 'PUT',
        body: JSON.stringify({ product: productData })
      })
      return response.product
    } catch (error) {
      console.error(`Failed to update Shopify product ${productId}:`, error)
      throw error
    }
  }

  // Get all products
  async getProducts(limit: number = 50): Promise<ShopifyProduct[]> {
    try {
      const response = await this.makeRequest(`/products.json?limit=${limit}`)
      return response.products || []
    } catch (error) {
      console.error('Failed to get Shopify products:', error)
      throw error
    }
  }

  // Upload image to Shopify
  async uploadProductImage(productId: number, imageData: ShopifyImage): Promise<ShopifyImage> {
    try {
      const response = await this.makeRequest(`/products/${productId}/images.json`, {
        method: 'POST',
        body: JSON.stringify({ image: imageData })
      })
      return response.image
    } catch (error) {
      console.error(`Failed to upload image for product ${productId}:`, error)
      throw error
    }
  }

  // Transform Printful product to Shopify format
  transformPrintfulToShopify(printfulProduct: any, customData: any = {}) {
    const baseTitle = customData.title || printfulProduct.name
    const baseDescription = customData.description || `High-quality ${printfulProduct.name} from Grit Collective`
    
    return {
      title: baseTitle,
      body_html: baseDescription,
      vendor: 'Grit Collective',
      product_type: 'Canvas Print',
      status: 'draft' as const,
      tags: customData.tags || 'canvas, wall art, motivational, home decor',
      variants: printfulProduct.variants.map((variant: any) => ({
        title: variant.name,
        price: variant.price.toString(),
        sku: variant.sku,
        inventory_quantity: 100,
        weight: 1.5,
        weight_unit: 'lb',
        requires_shipping: true,
        taxable: true,
        inventory_management: 'shopify',
        inventory_policy: 'deny' as const
      })),
      images: printfulProduct.thumbnail ? [
        {
          src: printfulProduct.thumbnail,
          alt: baseTitle,
          position: 1
        }
      ] : [],
      seo_title: customData.seoTitle || baseTitle,
      seo_description: customData.seoDescription || baseDescription.substring(0, 160)
    }
  }

  // Get shop information
  async getShopInfo() {
    try {
      const response = await this.makeRequest('/shop.json')
      return response.shop
    } catch (error) {
      console.error('Failed to get shop info:', error)
      throw error
    }
  }
}

export const shopifyAPI = new ShopifyAPI()
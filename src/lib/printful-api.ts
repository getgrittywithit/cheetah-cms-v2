const PRINTFUL_BASE_URL = 'https://api.printful.com'

export interface PrintfulProduct {
  id: number
  external_id: string
  name: string
  variants: PrintfulVariant[]
  sync_product: {
    id: number
    external_id: string
    name: string
    synced: number
  }
  thumbnail_url: string
}

export interface PrintfulVariant {
  id: number
  external_id: string
  sync_product_id: number
  name: string
  synced: number
  variant_id: number
  main_category_id: number
  warehouse_product_variant_id: number
  retail_price: string
  sku: string
  product: {
    variant_id: number
    product_id: number
    image: string
    name: string
  }
  files: PrintfulFile[]
}

export interface PrintfulFile {
  id: number
  type: string
  hash: string
  url: string
  filename: string
  mime_type: string
  size: number
  width: number
  height: number
  x: number
  y: number
  scale: number
  visible: boolean
}

class PrintfulAPI {
  private baseURL = PRINTFUL_BASE_URL
  private token: string
  private storeId: string

  constructor() {
    // Initialize with empty values, will be set in makeRequest
    this.token = ''
    this.storeId = ''
  }
  
  private ensureConfig() {
    if (!this.token) {
      this.token = process.env.PRINTFUL_API_TOKEN || ''
      this.storeId = process.env.PRINTFUL_STORE_ID || '16574654' // Default to user's store ID
      if (!this.token) {
        throw new Error('PRINTFUL_API_TOKEN is required')
      }
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    this.ensureConfig() // Ensure config is loaded
    const url = `${this.baseURL}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        'X-PF-Store-Id': this.storeId,
        ...options.headers,
      },
    })

    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch (e) {
        errorData = { error: response.statusText }
      }
      console.error('Printful API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        url,
        token: this.token ? `Present (${this.token.substring(0, 10)}...)` : 'Missing',
        storeId: this.storeId,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          'X-PF-Store-Id': this.storeId
        }
      })
      throw new Error(`Printful API Error: ${response.status} - ${errorData.error || errorData.message || JSON.stringify(errorData) || response.statusText}`)
    }

    const data = await response.json()
    return data
  }

  // Get all sync products from store
  async getSyncProducts(): Promise<PrintfulProduct[]> {
    try {
      const response = await this.makeRequest('/sync/products')
      return response.result || []
    } catch (error) {
      console.error('Failed to get sync products:', error)
      throw error
    }
  }

  // Get specific sync product with variants
  async getSyncProduct(productId: number): Promise<PrintfulProduct> {
    try {
      const response = await this.makeRequest(`/sync/products/${productId}`)
      return response.result
    } catch (error) {
      console.error(`Failed to get sync product ${productId}:`, error)
      throw error
    }
  }

  // Get store information
  async getStoreInfo() {
    try {
      const response = await this.makeRequest('/store')
      return response.result
    } catch (error) {
      console.error('Failed to get store info:', error)
      throw error
    }
  }

  // Create a new sync product (for future use)
  async createSyncProduct(productData: any) {
    try {
      const response = await this.makeRequest('/sync/products', {
        method: 'POST',
        body: JSON.stringify(productData)
      })
      return response.result
    } catch (error) {
      console.error('Failed to create sync product:', error)
      throw error
    }
  }

  // Transform Printful product to our format
  transformProduct(printfulProduct: any) {
    // Handle different response formats from /sync/products vs /sync/products/{id}
    const hasVariants = printfulProduct.sync_variants && Array.isArray(printfulProduct.sync_variants)
    const isSimpleFormat = !hasVariants && (!printfulProduct.variants || typeof printfulProduct.variants === 'number')
    
    if (isSimpleFormat) {
      // Simple format from /sync/products endpoint
      return {
        id: printfulProduct.id,
        external_id: printfulProduct.external_id,
        name: printfulProduct.name,
        thumbnail: printfulProduct.thumbnail_url,
        base_price: 0, // Will be updated when we get full details
        variant_count: printfulProduct.variants || 0,
        synced: printfulProduct.synced > 0,
        variants: [] // Empty array for simple format
      }
    } else if (hasVariants) {
      // Full format from /sync/products/{id} endpoint with sync_variants
      const variants = printfulProduct.sync_variants
      const basePrice = variants.length > 0 
        ? Math.min(...variants.map((v: any) => parseFloat(v.retail_price)))
        : 0
      
      return {
        id: printfulProduct.sync_product?.id || printfulProduct.id,
        external_id: printfulProduct.sync_product?.external_id || printfulProduct.external_id,
        name: printfulProduct.sync_product?.name || printfulProduct.name,
        thumbnail: printfulProduct.sync_product?.thumbnail_url || printfulProduct.thumbnail_url,
        base_price: basePrice,
        variant_count: variants.length,
        synced: printfulProduct.sync_product?.synced > 0,
        variants: variants.map((variant: any) => ({
          id: variant.id,
          name: variant.name,
          sku: variant.sku,
          price: parseFloat(variant.retail_price),
          product_name: variant.product.name,
          image: variant.product.image,
          synced: variant.synced === true
        }))
      }
    } else {
      // Legacy format or unexpected structure - handle variants array directly
      const variants = printfulProduct.variants || []
      const basePrice = variants.length > 0 
        ? Math.min(...variants.map((v: any) => parseFloat(v.retail_price)))
        : 0
      
      return {
        id: printfulProduct.id,
        external_id: printfulProduct.external_id,
        name: printfulProduct.name,
        thumbnail: printfulProduct.thumbnail_url,
        base_price: basePrice,
        variant_count: variants.length,
        synced: printfulProduct.sync_product?.synced === 1,
        variants: variants.map((variant: any) => ({
          id: variant.id,
          name: variant.name,
          sku: variant.sku,
          price: parseFloat(variant.retail_price),
          product_name: variant.product.name,
          image: variant.product.image,
          synced: variant.synced === 1
        }))
      }
    }
  }
}

export const printfulAPI = new PrintfulAPI()
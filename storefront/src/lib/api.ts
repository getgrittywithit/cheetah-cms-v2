// API client for connecting to CMS backend
const CMS_BASE_URL = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3000'

export class CMSApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = CMS_BASE_URL
  }

  async getProducts(brand: string, options?: {
    status?: string
    search?: string
    limit?: number
    offset?: number
  }) {
    const params = new URLSearchParams()
    if (options?.status) params.append('status', options.status)
    if (options?.search) params.append('search', options.search)
    if (options?.limit) params.append('limit', options.limit.toString())
    if (options?.offset) params.append('offset', options.offset.toString())

    const response = await fetch(`${this.baseUrl}/api/brands/${brand}/products?${params}`)
    if (!response.ok) {
      throw new Error('Failed to fetch products')
    }
    return response.json()
  }

  async getProduct(productId: string) {
    const response = await fetch(`${this.baseUrl}/api/products/${productId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch product')
    }
    return response.json()
  }

  async getBrandConfig(brand: string) {
    // This would be a new API endpoint to get brand configuration for storefront
    const response = await fetch(`${this.baseUrl}/api/brands/${brand}/config`)
    if (!response.ok) {
      throw new Error('Failed to fetch brand config')
    }
    return response.json()
  }

  async createOrder(orderData: Record<string, unknown>) {
    const response = await fetch(`${this.baseUrl}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    })
    if (!response.ok) {
      throw new Error('Failed to create order')
    }
    return response.json()
  }
}

// Singleton instance
export const cmsApi = new CMSApiClient()

// Helper functions for storefront
export async function getStorefrontProducts(brand: string) {
  try {
    const data = await cmsApi.getProducts(brand, { status: 'active' })
    return data.products || []
  } catch (error) {
    console.error('Error fetching storefront products:', error)
    return []
  }
}

export async function getStorefrontProduct(productId: string) {
  try {
    const data = await cmsApi.getProduct(productId)
    return data.product
  } catch (error) {
    console.error('Error fetching storefront product:', error)
    return null
  }
}

export function formatPrice(price: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(price)
}

export function generateProductUrl(brand: string, productSlug: string) {
  return `/${brand}/products/${productSlug}`
}

export function generateCategoryUrl(brand: string, category: string) {
  return `/${brand}/category/${category}`
}
interface ProductGenerationRequest {
  productName: string
  productType?: string
  brandContext?: string
  targetAudience?: string
  additionalDetails?: string
  variants?: Array<{
    name: string
    sku: string
    price: number
  }>
}

interface GeneratedProductData {
  // Basic Info
  title: string
  description: string
  category: string
  
  // Pricing
  price: number
  compareAtPrice?: number
  chargesTax: boolean
  costPerItem?: number
  
  // Inventory
  trackQuantity: boolean
  sku: string
  barcode?: string
  continueSellingWhenOutOfStock: boolean
  
  // Shipping
  isPhysicalProduct: boolean
  weight: number
  weightUnit: string
  
  // Organization
  type: string
  vendor: string
  collections: string[]
  tags: string[]
  themeTemplate: string
  
  // Publishing
  status: string
  salesChannels: string[]
  
  // SEO
  seoTitle: string
  seoDescription: string
  urlHandle: string
}

// Predefined collections for Grit Collective
const GRIT_COLLECTIONS = [
  'Canvas Art',
  'Motivational Decor', 
  'Workspace Essentials',
  'Home Gym Decor',
  'Office Inspiration',
  'Fitness Motivation',
  'Personal Growth',
  'Wall Art',
  'Desk Accessories',
  'Apparel',
  'Drinkware',
  'Best Sellers',
  'New Releases'
]

// Common categories for different product types
const PRODUCT_CATEGORIES = {
  'canvas': 'Home & Garden > Decor > Artwork > Posters, Prints, & Visual Artwork',
  'shirt': 'Apparel & Accessories > Clothing > Shirts & Tops',
  'mug': 'Home & Garden > Kitchen & Dining > Drinkware',
  'mat': 'Home & Garden > Decor > Rugs & Mats',
  'poster': 'Home & Garden > Decor > Artwork > Posters, Prints, & Visual Artwork',
  'hoodie': 'Apparel & Accessories > Clothing > Outerwear',
  'tank': 'Apparel & Accessories > Clothing > Shirts & Tops'
}

class AIProductGenerator {
  private async makeOpenAIRequest(messages: any[]) {
    const response = await fetch('/api/ai/generate-product', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ messages })
    })

    if (!response.ok) {
      throw new Error('Failed to generate product content')
    }

    const data = await response.json()
    return data.content
  }

  async generateProductData(request: ProductGenerationRequest): Promise<GeneratedProductData> {
    const systemPrompt = `You are an expert e-commerce product content creator for Grit Collective, a motivational brand focused on fitness, personal growth, and resilience. Generate comprehensive product details for Shopify.

Brand Voice:
- Motivational and empowering
- Speaks to people grinding toward their goals
- Emphasizes transformation and mindset
- Professional but relatable
- Action-oriented language

Target Audience: People focused on fitness, personal development, entrepreneurs, and those pursuing challenging goals.

IMPORTANT: Respond ONLY with a valid JSON object. No explanations, no markdown, just the JSON.

Available Collections: ${GRIT_COLLECTIONS.join(', ')}
Product Categories: ${Object.entries(PRODUCT_CATEGORIES).map(([key, val]) => `${key}: ${val}`).join(', ')}

HTML Description Template (customize the product-specific parts):
<div class="product-description">
<h2>[Product Title], [Key Quality]</h2>
<p>This <strong>[Product Name]</strong> [product description with symbolism/meaning]. [Product significance or what it represents].</p>
<h3>Details</h3>
<ul>
<li><strong>Design:</strong> [Design description]</li>
<li><strong>Symbolism:</strong> [What the product represents]</li>
<li><strong>Sizes:</strong> [List available sizes from variants]</li>
<li><strong>Material:</strong> [Material specs based on product type]</li>
<li><strong>Finish:</strong> [Finish quality description]</li>
<li><strong>Mounting:</strong> [Mounting/usage instructions]</li>
</ul>
<p><em>Perfect for [target audience description].</em></p>
<p><strong>Need a custom size?</strong> Email us at <a href="mailto:info@gritcollectiveco.com">info@gritcollectiveco.com</a> to request a special fit.</p>
<h3>Grit Collective Promise</h3>
<p>Every piece is made to order to reduce waste and maximize quality. Designed to bring color, meaning, and natural beauty into your everyday space.</p>
<h3>Shipping &amp; Returns</h3>
<ul>
<li>Ships in 7–14 business days in secure, gift-ready packaging</li>
<li>All sales final on made-to-order items</li>
<li><strong>Damage during delivery?</strong> Contact us for a prompt replacement at <a href="mailto:info@gritcollectiveco.com">info@gritcollectiveco.com</a></li>
</ul>
</div>

Return a JSON object with ALL these fields:
{
  "title": "Product title for Shopify",
  "description": "Complete HTML using the template above",
  "category": "Choose from product categories above",
  "price": 25.99,
  "compareAtPrice": null,
  "chargesTax": true,
  "costPerItem": 12.50,
  "trackQuantity": true,
  "sku": "GRIT-PRODUCT-SKU",
  "barcode": "",
  "continueSellingWhenOutOfStock": false,
  "isPhysicalProduct": true,
  "weight": 0.5,
  "weightUnit": "lb",
  "type": "Product type",
  "vendor": "Grit Collective",
  "collections": ["Collection1", "Collection2"],
  "tags": ["tag1", "tag2", "tag3"],
  "themeTemplate": "Default product",
  "status": "active",
  "salesChannels": ["Online Store", "Point of Sale"],
  "seoTitle": "SEO title (70 chars max)",
  "seoDescription": "Meta description (160 chars max)",
  "urlHandle": "product-url-handle"
}`

    const userPrompt = `Product: ${request.productName}
${request.productType ? `Type: ${request.productType}` : ''}
${request.brandContext ? `Context: ${request.brandContext}` : ''}
${request.targetAudience ? `Audience: ${request.targetAudience}` : ''}
${request.additionalDetails ? `Details: ${request.additionalDetails}` : ''}
${request.variants ? `Variants: ${request.variants.map(v => `${v.name} ($${v.price})`).join(', ')}` : ''}

Generate ALL Shopify product fields using the HTML template for description. Fill in the bracketed placeholders with product-specific information. Choose collections from the available list. Set realistic pricing based on similar products. Include all variant sizes in the description. Respond with ONLY the JSON object.`

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]

    const response = await this.makeOpenAIRequest(messages)
    
    try {
      // Try to extract JSON from the response if it contains extra text
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      return JSON.parse(response)
    } catch (error) {
      console.error('Failed to parse AI response:', response)
      throw new Error(`Failed to parse AI response as JSON: ${response.substring(0, 200)}...`)
    }
  }

  async refineProductData(currentData: GeneratedProductData, userFeedback: string): Promise<GeneratedProductData> {
    const systemPrompt = `You are refining product content for Grit Collective based on user feedback. Maintain the brand voice while incorporating the requested changes.

IMPORTANT: Respond ONLY with a valid JSON object. No explanations, no markdown, just the JSON.

Return the updated JSON object with the same structure as before.`

    const userPrompt = `Current product data:
${JSON.stringify(currentData, null, 2)}

User feedback: ${userFeedback}

Update the product data based on this feedback. Respond with ONLY the JSON object, no other text.`

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]

    const response = await this.makeOpenAIRequest(messages)
    
    try {
      // Try to extract JSON from the response if it contains extra text
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      return JSON.parse(response)
    } catch (error) {
      console.error('Failed to parse AI refinement response:', response)
      throw new Error(`Failed to parse AI response as JSON: ${response.substring(0, 200)}...`)
    }
  }

  async generateVariantDescriptions(productName: string, variants: any[]): Promise<Record<string, string>> {
    const systemPrompt = `Generate specific descriptions for product variants. Keep them concise but highlight what makes each variant unique.`

    const userPrompt = `Product: ${productName}
Variants: ${variants.map(v => `${v.name} - ${v.sku}`).join(', ')}

Generate a description for each variant that highlights its specific features.`

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]

    const response = await this.makeOpenAIRequest(messages)
    
    try {
      return JSON.parse(response)
    } catch (error) {
      throw new Error('Failed to parse variant descriptions')
    }
  }
}

export const aiProductGenerator = new AIProductGenerator()
export type { ProductGenerationRequest, GeneratedProductData }
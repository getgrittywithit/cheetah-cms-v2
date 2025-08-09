interface ProductGenerationRequest {
  productName: string
  productType?: string
  brandContext?: string
  targetAudience?: string
  additionalDetails?: string
}

interface GeneratedProductData {
  title: string
  description: string
  category: string
  tags: string[]
  seoTitle: string
  seoDescription: string
  type: string
  vendor: string
  collections: string[]
  compareAtPrice?: number
  weight?: number
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

Return a JSON object with these exact fields:
{
  "title": "SEO-optimized product title",
  "description": "HTML formatted rich description (2-3 paragraphs)",
  "category": "Apparel & Accessories",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "seoTitle": "60 character SEO title",
  "seoDescription": "160 character meta description",
  "type": "Product type for organization",
  "vendor": "Grit Collective",
  "collections": ["collection1", "collection2"],
  "compareAtPrice": null,
  "weight": 0.5
}`

    const userPrompt = `Product: ${request.productName}
${request.productType ? `Type: ${request.productType}` : ''}
${request.brandContext ? `Context: ${request.brandContext}` : ''}
${request.targetAudience ? `Audience: ${request.targetAudience}` : ''}
${request.additionalDetails ? `Details: ${request.additionalDetails}` : ''}

Generate all Shopify product fields for this item. Respond with ONLY the JSON object, no other text.`

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
import { NextRequest, NextResponse } from 'next/server'
import { getBrandConfig } from '@/lib/brand-config'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

interface OptimizationRequest {
  type: 'link' | 'description'
  productLink?: string
  productDescription?: string
  targetPrice?: number
  category: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: { brand: string } }
) {
  try {
    const brandConfig = getBrandConfig(params.brand)
    if (!brandConfig || params.brand !== 'grit-collective') {
      return NextResponse.json({ success: false, error: 'eBay feature only available for Grit Collective' }, { status: 404 })
    }

    const body: OptimizationRequest = await request.json()
    const { type, productLink, productDescription, targetPrice, category } = body

    if (!productLink && !productDescription) {
      return NextResponse.json({ success: false, error: 'Either product link or description is required' }, { status: 400 })
    }

    let productInfo = ''
    
    // If product link is provided, we'll use it as context (in a real app, you might scrape the page)
    if (type === 'link' && productLink) {
      productInfo = `Product URL: ${productLink}\nCategory: ${category}`
    } else if (type === 'description' && productDescription) {
      productInfo = `Product Description: ${productDescription}\nCategory: ${category}`
    }

    if (targetPrice) {
      productInfo += `\nTarget Price: $${targetPrice}`
    }

    const prompt = `You are an expert eBay listing optimizer specializing in maximizing visibility, searchability, and sales conversion. 

PRODUCT INFORMATION:
${productInfo}

Your task is to create an optimized eBay listing that follows eBay best practices and maximizes the chance of sales. Please provide:

1. OPTIMIZED TITLE (80 characters max, include key searchable terms, brand if applicable, condition, and main features)
2. DETAILED DESCRIPTION (compelling, informative, includes condition details, dimensions if relevant, shipping info, and uses persuasive language)
3. SUGGESTED PRICING (based on market research and the target price if provided)
4. CONDITION (New, Used - Excellent, Used - Good, etc.)
5. SEARCH KEYWORDS (15-20 relevant keywords that buyers would search for)

Focus on:
- Using high-traffic search terms
- Including condition and authenticity details
- Adding value propositions
- Professional presentation
- eBay algorithm optimization

Please format your response as JSON with the following structure:
{
  "title": "optimized listing title",
  "description": "detailed listing description with line breaks",
  "suggestedPrice": 25.99,
  "condition": "condition assessment",
  "keywords": ["keyword1", "keyword2", "..."]
}`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert eBay listing optimizer. Always respond with valid JSON only, no additional text or formatting."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    })

    const responseText = completion.choices[0].message.content
    if (!responseText) {
      throw new Error('No response from OpenAI')
    }

    let optimizedListing
    try {
      optimizedListing = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', responseText)
      throw new Error('Failed to parse optimization results')
    }

    // Validate the response structure
    if (!optimizedListing.title || !optimizedListing.description || !optimizedListing.keywords) {
      throw new Error('Invalid optimization response structure')
    }

    return NextResponse.json({ 
      success: true, 
      listing: optimizedListing 
    })

  } catch (error) {
    console.error('Error optimizing listing:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to optimize listing' },
      { status: 500 }
    )
  }
}
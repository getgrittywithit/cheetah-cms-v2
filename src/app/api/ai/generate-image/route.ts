import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { R2ImageUploader } from '@/lib/r2-upload'
import { getBrandConfig } from '@/lib/brand-config'

interface GenerateImageRequest {
  prompt: string
  brand: string
  brandSlug: string
  style?: 'natural' | 'vivid'
  size?: '1024x1024' | '1792x1024' | '1024x1792'
  quality?: 'standard' | 'hd'
}

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔵 AI Generate Image - Received request:', {
      hasPrompt: !!body.prompt,
      brand: body.brand,
      brandSlug: body.brandSlug,
      promptLength: body.prompt?.length,
      style: body.style,
      quality: body.quality,
      size: body.size
    })
    console.log('🔵 Raw prompt received:', body.prompt)
    
    const { 
      prompt, 
      brand, 
      brandSlug, 
      style = 'natural', 
      size = '1024x1024', 
      quality = 'standard' 
    }: GenerateImageRequest = body

    if (!prompt || !brand) {
      console.log('🔴 Missing required fields:', { 
        prompt: !!prompt, 
        brand: !!brand
      })
      return NextResponse.json(
        { error: 'Prompt and brand are required' },
        { status: 400 }
      )
    }

    // Get brand configuration
    const brandConfig = getBrandConfig(brandSlug)
    
    console.log('🔵 Generating image with DALL-E...')
    
    try {
      // For Daily Dish Dash and other brands with specific prompts, use them directly
      // Only enhance generic prompts
      const shouldEnhancePrompt = !prompt.includes('hyper-realistic') && !prompt.includes('photography') && !prompt.includes('professional')
      
      let imagePrompt
      if (shouldEnhancePrompt) {
        imagePrompt = generateImagePrompt(prompt, brand, brandConfig)
        console.log('🔵 Enhanced generic prompt:', imagePrompt)
      } else {
        imagePrompt = prompt // Use the detailed prompt as-is
        console.log('🔵 Using detailed prompt as-is:', imagePrompt)
      }
      
      const imageResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: imagePrompt,
        n: 1,
        size: size,
        quality: quality,
        style: style
      })
      
      const dalleUrl = imageResponse.data[0]?.url
      console.log('🔵 DALL-E response received, image URL:', dalleUrl ? 'Generated successfully' : 'No URL returned')
      
      if (!dalleUrl) {
        return NextResponse.json(
          { error: 'Failed to generate image - no URL returned from DALL-E' },
          { status: 500 }
        )
      }

      console.log('🔵 Uploading image to R2...')
      const r2Uploader = new R2ImageUploader(brandSlug)
      const fileName = `ai-generated-${brand.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
      
      const uploadResult = await r2Uploader.uploadImageFromUrl(dalleUrl, fileName)
      
      let finalImageUrl = dalleUrl // Fallback to DALL-E URL
      
      if (uploadResult.success && uploadResult.url) {
        finalImageUrl = uploadResult.url
        console.log('🔵 Image successfully uploaded to R2:', finalImageUrl)
      } else {
        console.error('🔴 R2 upload failed, using DALL-E URL as fallback:', uploadResult.error)
      }

      const response = {
        success: true,
        imageUrl: finalImageUrl,
        dalleUrl: dalleUrl,
        r2Url: uploadResult.success ? uploadResult.url : null,
        prompt: imagePrompt,
        brand,
        timestamp: new Date().toISOString()
      }

      console.log('🟢 AI image generation completed successfully')
      return NextResponse.json(response)

    } catch (imageError) {
      console.error('🔴 DALL-E Image generation error:')
      console.error('🔴 Error details:', imageError)
      console.error('🔴 Prompt used:', imagePrompt || 'undefined')
      console.error('🔴 Request params:', { style, size, quality, brand })
      
      // Log specific DALL-E error types
      if (imageError instanceof Error) {
        console.error('🔴 Error message:', imageError.message)
        console.error('🔴 Error stack:', imageError.stack)
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to generate image with DALL-E',
          details: imageError instanceof Error ? imageError.message : 'Unknown error',
          prompt: imagePrompt,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('🔴 AI image generation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate AI image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function generateImagePrompt(prompt: string, brand: string, brandConfig: any): string {
  // Brand-specific visual styles
  const brandStyle = getBrandVisualStyle(brand, brandConfig)
  
  // Enhanced prompt with brand identity
  const enhancedPrompt = `
Create a high-quality, professional image for ${brand}.

CONTENT: ${prompt}

BRAND STYLE: ${brandStyle}

VISUAL REQUIREMENTS:
- High-quality, professional photography style
- Clean, modern composition
- Good lighting and vibrant colors
- Social media optimized
- Brand-appropriate aesthetic
- Engaging and eye-catching
- Suitable for social media posting

TECHNICAL SPECS:
- Sharp focus and high detail
- Optimized for social media platforms
- Professional quality
- Clean background when appropriate
`.trim()

  return enhancedPrompt
}

function getBrandVisualStyle(brand: string, brandConfig: any): string {
  if (!brandConfig) {
    return 'Clean, modern, professional aesthetic'
  }

  // Industry-specific visual styles
  const industryStyles = {
    'Food & Cooking': 'Appetizing food photography, warm lighting, natural ingredients, kitchen settings, mouth-watering presentation',
    'Home Decor & Lifestyle': 'Stylish interior design, cozy atmospheres, modern home aesthetics, inspiring spaces, lifestyle photography',
    'Fitness & Wellness': 'Active lifestyle, healthy living, motivational imagery, clean gym environments, outdoor fitness',
    'Fashion & Beauty': 'Stylish fashion photography, beauty shots, trendy aesthetics, lifestyle modeling',
    'Technology': 'Clean tech aesthetics, modern devices, minimalist design, professional environments',
    'Travel': 'Beautiful destinations, adventure photography, cultural experiences, scenic landscapes',
    'Business': 'Professional environments, corporate aesthetics, clean office spaces, business lifestyle'
  }

  const brandIndustry = brandConfig.industry || 'General'
  const baseStyle = industryStyles[brandIndustry as keyof typeof industryStyles] || 'Professional, clean, modern aesthetic'

  // Add brand personality influences
  const personality = brandConfig.aiSettings?.personality || []
  let styleModifiers = ''
  
  if (personality.includes('Energetic')) styleModifiers += ', dynamic and vibrant'
  if (personality.includes('Minimalist')) styleModifiers += ', clean and minimal'
  if (personality.includes('Luxurious')) styleModifiers += ', high-end and sophisticated'
  if (personality.includes('Playful')) styleModifiers += ', fun and engaging'
  if (personality.includes('Natural')) styleModifiers += ', organic and natural'

  return `${baseStyle}${styleModifiers}`
}
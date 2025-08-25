import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing DALL-E integration...')
    
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'OpenAI API key not found',
        hasKey: false
      })
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    console.log('OpenAI client initialized, attempting image generation...')

    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: "A simple test image: a red apple on a white background, photographic style, high quality",
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "natural"
    })

    const imageUrl = imageResponse.data[0]?.url
    console.log('DALL-E test successful, image URL:', imageUrl ? 'Generated' : 'None')

    return NextResponse.json({
      success: true,
      hasKey: true,
      imageGenerated: !!imageUrl,
      imageUrl: imageUrl,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('DALL-E test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      hasKey: !!process.env.OPENAI_API_KEY
    }, { status: 500 })
  }
}
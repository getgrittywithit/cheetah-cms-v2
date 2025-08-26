import { NextRequest, NextResponse } from 'next/server'

// Simple endpoint to test image generation and show detailed logs
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, brand, brandSlug } = body

    console.log('🔍 DEBUG: Testing image generation')
    console.log('🔍 Input:', { prompt, brand, brandSlug })
    
    // Make the actual image generation request
    const imageResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api/ai/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        brand,
        brandSlug,
        style: brandSlug === 'daily-dish-dash' ? 'vivid' : 'natural',
        quality: 'hd',
        size: '1024x1024'
      })
    })

    const result = await imageResponse.json()
    
    console.log('🔍 Image generation result:', {
      success: result.success,
      hasImageUrl: !!result.imageUrl,
      error: result.error,
      details: result.details,
      prompt: result.prompt
    })

    return NextResponse.json({
      success: true,
      imageGenerationResult: result,
      logs: {
        message: 'Check server logs for detailed DALL-E interaction',
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('🔍 DEBUG: Image generation test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// GET endpoint to show recent logs (if needed)
export async function GET() {
  return NextResponse.json({
    message: 'Image generation debug endpoint',
    usage: 'POST with { prompt, brand, brandSlug } to test image generation',
    logs: 'Check server console for detailed logs with 🔵 and 🔴 emojis',
    timestamp: new Date().toISOString()
  })
}
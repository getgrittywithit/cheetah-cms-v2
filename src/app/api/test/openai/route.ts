import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function GET(request: NextRequest) {
  try {
    console.log('🔵 Testing OpenAI API key...')
    
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'OPENAI_API_KEY environment variable not set',
        hasKey: false
      })
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    console.log('🔵 OpenAI client created, testing with simple completion...')

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: "Say 'Hello from OpenAI API test!'" }
      ],
      max_tokens: 20,
      temperature: 0.5,
    })

    const response = completion.choices[0]?.message?.content

    return NextResponse.json({
      success: true,
      hasKey: true,
      keyLength: process.env.OPENAI_API_KEY.length,
      testResponse: response,
      usage: completion.usage
    })

  } catch (error) {
    console.error('🔴 OpenAI API test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      hasKey: !!process.env.OPENAI_API_KEY,
      keyLength: process.env.OPENAI_API_KEY?.length || 0
    }, { status: 500 })
  }
}
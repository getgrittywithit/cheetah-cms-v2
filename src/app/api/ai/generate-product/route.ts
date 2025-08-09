import { NextResponse } from 'next/server'
import OpenAI from 'openai'

let openai: OpenAI | null = null

function getOpenAI() {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  }
  return openai
}

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    const openaiClient = getOpenAI()
    if (!openaiClient) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.7,
      max_tokens: 1500
    })

    const content = completion.choices[0]?.message?.content

    if (!content) {
      throw new Error('No response generated')
    }

    return NextResponse.json({
      success: true,
      content
    })

  } catch (error) {
    console.error('OpenAI API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate content'
      },
      { status: 500 }
    )
  }
}
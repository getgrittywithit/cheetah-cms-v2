import { NextRequest, NextResponse } from 'next/server'
import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt, brand, tone } = await request.json()

    if (!prompt) {
      return NextResponse.json({ 
        success: false, 
        error: 'Prompt is required' 
      }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        success: false, 
        error: 'OpenAI API key not configured' 
      }, { status: 500 })
    }

    const systemPrompt = `You are a professional content writer creating blog posts for ${brand}. 
    
Brand voice: ${tone || 'motivational and inspiring'}

Generate a complete blog post with:
1. An engaging title
2. A compelling excerpt (1-2 sentences) 
3. Full blog content (800-1200 words) in markdown format
4. 3-5 relevant tags

Focus on high-quality, engaging content that provides real value to readers. Use a ${tone} tone throughout.

Return your response in this exact JSON format:
{
  "title": "Blog post title here",
  "excerpt": "Brief compelling excerpt here",
  "content": "Full markdown blog content here",
  "tags": ["tag1", "tag2", "tag3"]
}`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })

    const generatedText = completion.choices[0]?.message?.content
    if (!generatedText) {
      throw new Error('No content generated from OpenAI')
    }

    try {
      const parsedContent = JSON.parse(generatedText)
      
      return NextResponse.json({
        success: true,
        title: parsedContent.title,
        excerpt: parsedContent.excerpt,
        content: parsedContent.content,
        tags: parsedContent.tags
      })
    } catch (parseError) {
      // Fallback if JSON parsing fails
      return NextResponse.json({
        success: true,
        title: 'AI Generated Blog Post',
        excerpt: 'Generated content for your blog.',
        content: generatedText,
        tags: ['ai-generated', 'blog']
      })
    }

  } catch (error) {
    console.error('AI blog generation error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate blog content' 
    }, { status: 500 })
  }
}
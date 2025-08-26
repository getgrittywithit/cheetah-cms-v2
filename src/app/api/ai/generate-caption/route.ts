import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getBrandConfig } from '@/lib/brand-config'

interface GenerateCaptionRequest {
  prompt: string
  brand: string
  brandSlug: string
  platforms: string[]
  tone?: string
  style?: string
}

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔵 AI Generate Caption - Received request:', {
      hasPrompt: !!body.prompt,
      brand: body.brand,
      platforms: body.platforms,
      promptLength: body.prompt?.length
    })
    
    const { prompt, brand, brandSlug, platforms, tone, style }: GenerateCaptionRequest = body

    if (!prompt || !brand || !platforms || platforms.length === 0) {
      console.log('🔴 Missing required fields:', { 
        prompt: !!prompt, 
        brand: !!brand, 
        platforms: platforms?.length 
      })
      return NextResponse.json(
        { error: 'Prompt, brand, and platforms are required' },
        { status: 400 }
      )
    }

    // Get brand configuration for AI settings
    const brandConfig = getBrandConfig(brandSlug)
    const brandVoice = brandConfig?.aiSettings?.voice || 'Professional and engaging'
    const brandPersonality = brandConfig?.aiSettings?.personality?.join(', ') || 'Helpful, informative'

    console.log('🔵 Generating AI caption for platforms:', platforms)
    
    // Generate ONE universal caption that works across all platforms
    let generatedPosts
    try {
      console.log('🔵 Generating universal AI caption for all platforms')
      const universalPost = await generateAICaptionForPlatform(prompt, brand, 'universal', tone, style, brandVoice, brandPersonality)
      console.log('🔵 Generated universal caption', {
        hasContent: !!universalPost.content,
        contentLength: universalPost.content?.length,
        hashtagsCount: universalPost.hashtags?.length
      })
      
      // Create the same post for each platform
      generatedPosts = platforms.map(platform => ({
        platform,
        content: universalPost.content,
        hashtags: universalPost.hashtags,
        suggestions: universalPost.suggestions
      }))
      
      console.log('🔵 Applied universal caption to', platforms.length, 'platforms')
      
    } catch (error) {
      console.error('🔴 Error generating universal caption:', error)
      
      // Fallback: create simple posts for each platform
      generatedPosts = platforms.map(platform => ({
        platform,
        content: `Error generating content. Please try again.`,
        hashtags: [],
        suggestions: []
      }))
    }

    const response = {
      success: true,
      posts: generatedPosts,
      brand,
      timestamp: new Date().toISOString()
    }

    console.log('🟢 AI caption generation completed successfully for', platforms.length, 'platforms')
    return NextResponse.json(response)

  } catch (error) {
    console.error('🔴 AI caption generation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate AI captions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function generateAICaptionForPlatform(
  prompt: string, 
  brand: string, 
  platform: string, 
  tone?: string, 
  style?: string,
  brandVoice?: string,
  brandPersonality?: string
) {
  const platformSpecific = getPlatformSpecificGuidelines(platform)
  
  const systemPrompt = `You are an expert social media content creator for ${brand}.

BRAND VOICE: ${brandVoice}
BRAND PERSONALITY: ${brandPersonality}

PLATFORM: ${platform}
${platformSpecific}

Your task is to create engaging, platform-optimized content that:
1. Captures the brand's unique voice and personality
2. Is optimized for ${platform}'s algorithm and audience behavior
3. Includes relevant, trending hashtags
4. Drives engagement and builds community

${tone ? `TONE: ${tone}` : ''}
${style ? `STYLE: ${style}` : ''}

Return a JSON object with:
- content: The main post text (optimized for platform character limits)
- hashtags: Array of relevant hashtags (without # symbol)
- suggestions: Array of 3 alternative approaches or improvements`

  const userPrompt = `Create a ${platform} post about: ${prompt}

Requirements:
- Write in ${brand}'s voice: ${brandVoice}
- Personality traits: ${brandPersonality}
- Make it platform-optimized for ${platform}
- Include call-to-action appropriate for the platform
- Add relevant hashtags that will increase visibility
- Keep within platform character limits`

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.8,
    max_tokens: 1000,
  })

  const responseText = completion.choices[0]?.message?.content
  if (!responseText) {
    throw new Error('No response from OpenAI')
  }

  try {
    // Clean the response - remove markdown code blocks if present
    let cleanedResponse = responseText.trim()
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\s*/, '').replace(/\s*```$/, '')
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```\s*/, '').replace(/\s*```$/, '')
    }
    
    return JSON.parse(cleanedResponse)
  } catch (error) {
    console.error('Failed to parse AI response as JSON:', error)
    console.log('Raw response:', responseText)
    
    // Fallback if JSON parsing fails
    return {
      content: responseText,
      hashtags: [],
      suggestions: []
    }
  }
}

function getPlatformSpecificGuidelines(platform: string): string {
  const guidelines = {
    universal: `
UNIVERSAL SOCIAL MEDIA POST - Works across all platforms
CHARACTER LIMIT: Keep under 280 characters for maximum compatibility
BEST PRACTICES:
- Write engaging, universal content that works on any platform
- Use 3-5 relevant hashtags maximum
- Include a clear call-to-action
- Use emojis sparingly for visual appeal
- Ask questions to encourage engagement
- Keep content platform-neutral but engaging
- Focus on value and authentic brand voice`,

    instagram: `
CHARACTER LIMIT: 2,200 characters
BEST PRACTICES:
- Use 3-5 hashtags in the caption, more in first comment
- Include call-to-action (like, comment, share, save)
- Write for mobile-first reading
- Use emojis to break up text
- Ask questions to encourage comments
- Optimize for Instagram's algorithm (engagement within first hour is crucial)`,

    facebook: `
CHARACTER LIMIT: 63,206 characters (but optimal is 40-80 characters for reach)
BEST PRACTICES:
- Keep initial text short and engaging (first 90 characters are crucial)
- Use storytelling approach
- Include call-to-action
- Ask questions to encourage comments
- Use 1-2 relevant hashtags maximum
- Optimize for Facebook's algorithm (meaningful interactions matter)`,

    twitter: `
CHARACTER LIMIT: 280 characters
BEST PRACTICES:
- Be concise and punchy
- Use 1-2 hashtags maximum
- Include mentions when relevant
- Use threads for longer content
- Optimize for retweets and replies
- Include clear call-to-action
- Use Twitter-specific language and trends`,

    youtube: `
BEST PRACTICES:
- Write compelling titles (under 60 characters)
- Create detailed descriptions (125+ words)
- Use relevant keywords for SEO
- Include timestamps for longer videos
- Add calls-to-action (subscribe, like, comment)
- Use 3-5 relevant hashtags
- Include links to related content`,

    tiktok: `
CHARACTER LIMIT: 2,200 characters
BEST PRACTICES:
- Use trending hashtags and sounds
- Keep captions short and punchy
- Include call-to-action (like, share, follow)
- Use relevant trending challenges
- Optimize for FYP (For You Page)
- Include question to encourage comments`,

    linkedin: `
CHARACTER LIMIT: 3,000 characters (but 150-300 is optimal)
BEST PRACTICES:
- Start with a hook in first line
- Use professional yet conversational tone
- Share insights and add value
- Use 3-5 relevant hashtags
- Tag relevant people/companies when appropriate
- Include call-to-action for professional engagement`,

    pinterest: `
CHARACTER LIMIT: 500 characters
BEST PRACTICES:
- Write descriptive, keyword-rich text
- Use relevant keywords for Pinterest SEO
- Include call-to-action
- Add relevant hashtags
- Write for Pinterest's search functionality
- Focus on value and inspiration`
  }

  return guidelines[platform as keyof typeof guidelines] || `
GENERAL BEST PRACTICES:
- Keep content engaging and valuable
- Use relevant hashtags
- Include clear call-to-action
- Optimize for platform's specific audience and algorithm`
}
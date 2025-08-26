import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { R2ImageUploader } from '@/lib/r2-upload'

interface GeneratePostRequest {
  prompt: string
  brand: string
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
    console.log('🔵 AI Generate Post - Received request:', {
      hasPrompt: !!body.prompt,
      brand: body.brand,
      platforms: body.platforms,
      promptLength: body.prompt?.length
    })
    
    const { prompt, brand, platforms, tone, style }: GeneratePostRequest = body

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

    console.log('Generating AI posts for platforms:', platforms)
    
    // Generate posts using OpenAI for each platform
    const generatedPosts = await Promise.all(platforms.map(async (platform) => {
      console.log('🔵 Generating AI content for platform:', platform)
      try {
        const post = await generateAIPostForPlatform(prompt, brand, platform, tone, style)
        console.log('🔵 Generated post for', platform, {
          hasContent: !!post.content,
          contentLength: post.content?.length,
          hashtagsCount: post.hashtags?.length,
          hasImageUrl: !!post.imageUrl
        })
        return {
          platform,
          content: post.content,
          hashtags: post.hashtags,
          suggestions: post.suggestions,
          imageUrl: post.imageUrl
        }
      } catch (error) {
        console.error('🔴 Failed to generate for platform', platform, error)
        throw error
      }
    }))

    console.log('Generated AI posts:', generatedPosts.length)

    return NextResponse.json({
      success: true,
      posts: generatedPosts,
      originalPrompt: prompt
    })
  } catch (error) {
    console.error('🔴 AI generation error:', error)
    console.error('🔴 Error stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json(
      { 
        error: `Failed to generate posts: ${error instanceof Error ? error.message : error}`,
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

async function generateAIPostForPlatform(prompt: string, brand: string, platform: string, tone?: string, style?: string) {
  if (!process.env.OPENAI_API_KEY) {
    console.log('No OpenAI API key found, falling back to template')
    return generateTemplatePostForPlatform(prompt, brand, platform, tone, style)
  }
  
  console.log('OpenAI API key found, using AI generation')

  try {
    const brandContext = getBrandContext(brand)
    const platformSpecs = getPlatformSpecs(platform)
    
    const systemPrompt = brand === 'Daily Dish Dash' 
      ? `You are an expert recipe creator and food content writer for Daily Dish Dash - focusing on QUICK, EASY recipes for busy people.

Brand Focus: Quick recipes (15-30 minutes max), accessible ingredients, simple techniques
Target Audience: ${brandContext.audience}
Platform: ${platform}

Create a ${platform} post with this EXACT structure:

🍽️ [DISH NAME] - Ready in [TIME]!

[2-3 sentences about why this recipe is perfect for busy people]

INGREDIENTS:
• [ingredient 1]
• [ingredient 2] 
• [ingredient 3]
• [etc - keep to 5-8 ingredients max]

QUICK STEPS:
1. [Step 1 - keep each step to 1 sentence]
2. [Step 2]
3. [Step 3]
4. [Step 4 - usually 3-5 steps total]

💡 PRO TIP: [One helpful cooking tip]

What's your go-to quick dinner? Let me know! 👇

IMPORTANT: 
- Focus on recipes that take 30 minutes or less
- Use common ingredients people have at home
- Keep instructions super simple
- Always include the ready time in the title
- Make it sound achievable for beginners`
      
      : `You are an expert social media content creator for ${brand}. 

Brand Voice: ${brandContext.voice}
Brand Values: ${brandContext.values}
Target Audience: ${brandContext.audience}

Platform: ${platform}
Platform Guidelines: ${platformSpecs.guidelines}
Character Limit: ${platformSpecs.charLimit}
Best Practices: ${platformSpecs.bestPractices}

Create a ${platform} post with this structure:
1. HOOK: Attention-grabbing opening line
2. VALUE: Useful content, tip, or insight  
3. CTA: Clear call-to-action for engagement

Make it feel authentic and conversational while maintaining the brand voice.`

    const userPrompt = brand === 'Daily Dish Dash'
      ? `Create a complete recipe post for: ${prompt}

Requirements:
- Follow the EXACT structure provided in the system prompt
- Create a realistic recipe that takes 30 minutes or less
- Use ingredients that are commonly available
- Make instructions beginner-friendly
- Include the cooking time in the dish name
- Add appropriate food emojis
- Make it sound achievable and exciting

Return ONLY the recipe post content following the structure, no explanations.`

      : `Create a ${platform} post about: ${prompt}

Requirements:
- Start with a compelling hook
- Provide valuable content related to the topic
- End with an engaging call-to-action
- Use appropriate emojis for ${platform}
- Match ${brand}'s tone of voice
- Include engagement-driving elements

Return ONLY the post content, no explanations.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: platformSpecs.maxTokens,
      temperature: 0.7,
    })

    const content = completion.choices[0]?.message?.content || ''
    
    // Generate hashtags with AI
    const hashtagPrompt = `Generate ${platformSpecs.hashtagCount} relevant hashtags for this ${platform} post about "${prompt}" for brand ${brand}. Return only hashtags separated by spaces, no explanations.`
    
    const hashtagCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: hashtagPrompt }],
      max_tokens: 100,
      temperature: 0.5,
    })

    const hashtagString = hashtagCompletion.choices[0]?.message?.content || ''
    const hashtags = hashtagString.split(' ').filter(tag => tag.startsWith('#')).slice(0, platformSpecs.hashtagCount)

    // Generate AI image with DALL-E and upload to R2
    let imageUrl = null
    try {
      console.log('🔵 Starting DALL-E image generation...')
      const imagePrompt = generateImagePrompt(prompt, brand, content)
      console.log('🔵 Generated image prompt:', imagePrompt)
      
      const imageResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: imagePrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "natural"
      })
      
      const dalleUrl = imageResponse.data[0]?.url
      console.log('🔵 DALL-E response received, image URL:', dalleUrl ? 'Generated successfully' : 'No URL returned')
      
      if (dalleUrl) {
        console.log('🔵 Uploading DALL-E image to R2...')
        const r2Uploader = new R2ImageUploader()
        const fileName = `${platform}-${brand.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
        
        const uploadResult = await r2Uploader.uploadImageFromUrl(dalleUrl, fileName)
        
        if (uploadResult.success && uploadResult.url) {
          imageUrl = uploadResult.url
          console.log('🔵 Image successfully uploaded to R2:', imageUrl)
        } else {
          console.error('🔴 R2 upload failed:', uploadResult.error)
          imageUrl = dalleUrl // Fallback to DALL-E URL
        }
      }
    } catch (imageError) {
      console.error('🔴 DALL-E or R2 upload error:', imageError)
      console.error('🔴 Error details:', JSON.stringify(imageError, null, 2))
      // Continue without image if generation fails
    }

    const suggestions = platformSpecs.suggestions

    return { content, hashtags, suggestions, imageUrl }

  } catch (error) {
    console.error('OpenAI API error:', error)
    // Fallback to template on error
    return generateTemplatePostForPlatform(prompt, brand, platform, tone, style)
  }
}

function generateImagePrompt(originalPrompt: string, brand: string, postContent: string): string {
  // Analyze the actual post content and original prompt for specific details
  const fullContext = originalPrompt + ' ' + postContent
  
  // Extract specific food/ingredients mentioned
  const foodMatches = fullContext.match(/\b(pasta|spaghetti|noodles|salad|avocado|tomato|garlic|herbs|basil|chicken|salmon|quinoa|rice|bread|eggs|coffee|smoothie|soup|stir.fry|tacos|pizza|sandwich|wrap|bowl|curry|steak|vegetables|broccoli|spinach|kale|mushrooms|peppers|onions|carrots)\b/gi) || []
  
  // Extract cooking methods and time indicators
  const cookingMethods = fullContext.match(/\b(grilled|roasted|sautéed|baked|steamed|pan.seared|slow.cooked|air.fried|15.minute|30.minute|quick|easy|healthy|fresh|homemade|comfort.food)\b/gi) || []
  
  // Extract specific items for Grit Collective
  const homeItems = fullContext.match(/\b(candle|candles|wall.art|print|mug|coffee.mug|decor|home|cozy|aesthetic|minimalist|handmade|rustic|modern|inspiration|motivation|workspace|desk|living.room|bedroom)\b/gi) || []
  
  let imagePrompt = ""
  
  if (brand === 'Daily Dish Dash') {
    // Extract dish name from the original prompt for better image generation
    const dishName = originalPrompt.replace(/recipe|make|cook|prepare/gi, '').trim()
    
    if (foodMatches.length > 0) {
      // Create specific recipe photography prompt
      const mainIngredients = foodMatches.slice(0, 3).join(', ')
      const cookingStyle = cookingMethods.length > 0 ? cookingMethods[0] : 'perfectly prepared'
      
      imagePrompt = `Professional recipe photography of ${cookingStyle} ${dishName} featuring ${mainIngredients}, beautifully plated and ready to serve`
      
      // Add specific styling for recipe content
      if (/quick|easy|15.minute|30.minute|fast/i.test(fullContext)) {
        imagePrompt += ", simple home-style presentation on a white or light wooden surface, natural daylight, approachable and appetizing"
      } else if (/healthy|fresh|light/i.test(fullContext)) {
        imagePrompt += ", fresh colorful ingredients visible, clean bright styling, healthy and vibrant presentation"  
      } else if (/pasta|noodles|spaghetti/i.test(fullContext)) {
        imagePrompt += ", perfectly twirled pasta in a shallow bowl, steam rising, fork beside the dish, rustic wooden background"
      } else if (/salad|bowl|grain/i.test(fullContext)) {
        imagePrompt += ", overhead shot in a beautiful bowl, all ingredients visible, colorful and fresh presentation"
      } else {
        imagePrompt += ", home-style presentation that looks achievable, warm inviting lighting, styled but not intimidating"
      }
      
      imagePrompt += ", food photography for social media, looks delicious and doable, realistic home cooking presentation"
    } else {
      // Generic cooking scene based on prompt content
      if (/kitchen|cooking|prep/i.test(fullContext)) {
        imagePrompt = "Clean, organized kitchen countertop with fresh ingredients and cooking utensils, warm natural lighting, home cooking atmosphere"
      } else if (/meal.prep|planning/i.test(fullContext)) {
        imagePrompt = "Meal prep containers with colorful, healthy ingredients neatly organized, clean kitchen background, top-down view"
      } else {
        imagePrompt = "Beautifully set dining table with delicious homemade food, warm inviting atmosphere, soft natural lighting"
      }
    }
  } else if (brand === 'Grit Collective Co.') {
    if (homeItems.length > 0) {
      const specificItems = homeItems.slice(0, 2).join(' and ')
      imagePrompt = `Aesthetic flat lay featuring handmade ${specificItems}, minimalist styling`
      
      if (/motivation|inspiration|workspace/i.test(fullContext)) {
        imagePrompt += ", clean desk setup, inspirational quote visible but subtle, warm lighting, productivity vibes"
      } else if (/cozy|home|living/i.test(fullContext)) {
        imagePrompt += ", cozy home interior, soft textures, warm earthy tones, Scandinavian aesthetic"
      } else if (/candle|candlelight/i.test(fullContext)) {
        imagePrompt += ", warm candlelight, hygge atmosphere, soft shadows, peaceful evening vibes"
      } else {
        imagePrompt += ", modern minimalist styling, neutral color palette, Instagram-worthy arrangement"
      }
      
      imagePrompt += ", handcrafted artisan quality, natural materials, high-end product photography"
    } else {
      // Generic inspirational scene
      if (/morning|coffee|start/i.test(fullContext)) {
        imagePrompt = "Inspiring morning scene with handmade coffee mug, journal, and candle, soft morning light, minimalist aesthetic"
      } else if (/evening|relax|unwind/i.test(fullContext)) {
        imagePrompt = "Cozy evening setup with lit candles, soft textures, warm lighting, peaceful home atmosphere"
      } else if (/workspace|productivity|focus/i.test(fullContext)) {
        imagePrompt = "Clean, inspiring workspace with handmade decor items, natural lighting, productivity and motivation vibes"
      } else {
        imagePrompt = "Beautifully styled home interior showcase featuring handcrafted decor items, modern minimalist aesthetic, warm natural lighting"
      }
    }
  } else {
    // Generic lifestyle image based on content
    imagePrompt = `Professional lifestyle photography related to: ${originalPrompt.substring(0, 100)}, clean aesthetic, good lighting, social media ready`
  }
  
  // Add technical photography specs for better quality
  imagePrompt += ", shot with professional DSLR, perfect focus, vibrant but natural colors, high resolution, commercial photography quality"
  
  // Ensure no text appears in images
  imagePrompt += ", no text, no words, no letters visible anywhere in the image"
  
  return imagePrompt
}

function getBrandContext(brand: string) {
  const contexts = {
    'Daily Dish Dash': {
      voice: 'Friendly, helpful, and enthusiastic about food. Encouraging and approachable.',
      values: 'Quick, accessible, delicious food that fits busy lifestyles',
      audience: 'Busy professionals and home cooks looking for quick, tasty meal solutions'
    },
    'Grit Collective Co.': {
      voice: 'Inspirational, authentic, encouraging with a slightly edgy vibe',
      values: 'Handmade products that inspire and motivate, setting moods and sparking moments',
      audience: 'Design-conscious consumers seeking motivation and aesthetic home decor'
    }
  }
  return contexts[brand as keyof typeof contexts] || contexts['Daily Dish Dash']
}

function getPlatformSpecs(platform: string) {
  const specs = {
    instagram: {
      charLimit: '2200 characters',
      maxTokens: 300,
      hashtagCount: 10,
      guidelines: 'Visual-focused, emoji-rich, story-driven content',
      bestPractices: 'Use line breaks, emojis, ask questions, encourage saves/shares',
      suggestions: [
        'Add a high-quality image or video',
        'Use Instagram Stories for behind-the-scenes content',
        'Consider Reels for higher engagement',
        'Post during peak hours (11am-2pm, 5-7pm)'
      ]
    },
    facebook: {
      charLimit: '63,206 characters',
      maxTokens: 400,
      hashtagCount: 5,
      guidelines: 'Longer-form, conversation-starting content',
      bestPractices: 'Tell stories, ask questions, encourage comments',
      suggestions: [
        'Facebook favors longer, engaging content',
        'Ask questions to boost engagement',
        'Share personal stories and experiences',
        'Consider Facebook Live for authentic connection'
      ]
    },
    twitter: {
      charLimit: '280 characters',
      maxTokens: 100,
      hashtagCount: 3,
      guidelines: 'Concise, timely, conversation-focused',
      bestPractices: 'Be concise, use threads for longer content, join trending conversations',
      suggestions: [
        'Keep it under 280 characters',
        'Use Twitter threads for detailed tips',
        'Engage with trending hashtags when relevant',
        'Tweet during peak hours (9am-10am, 7-9pm)'
      ]
    }
  }
  return specs[platform as keyof typeof specs] || specs.instagram
}

function generateTemplatePostForPlatform(prompt: string, brand: string, platform: string, tone?: string, style?: string) {
  // Extract key themes from the prompt
  const isRecipe = /recipe|cook|ingredient|meal|dish|food/i.test(prompt)
  const isTip = /tip|trick|hack|how to|advice/i.test(prompt)
  const isQuestion = /\?/.test(prompt)
  const isPersonal = /I |my |today|just/i.test(prompt)

  // Brand-specific context
  const brandContext = {
    'Daily Dish Dash': {
      voice: 'friendly, encouraging, food-passionate',
      hashtags: ['#dailydishdash', '#quickmeals', '#foodie', '#cooking'],
      audience: 'busy professionals looking for quick meal solutions'
    },
    'Grit Collective Co.': {
      voice: 'inspirational, authentic, encouraging with slight edge',
      hashtags: ['#gritcollectiveco', '#setthemood', '#sparkthemoment', '#grithappens', '#handmadedecor'],
      audience: 'design-conscious consumers seeking motivation and aesthetic home decor'
    }
  }

  const context = brandContext[brand as keyof typeof brandContext] || brandContext['Daily Dish Dash']

  // Platform-specific adaptations
  let content = ''
  let hashtags: string[] = []
  let suggestions: string[] = []

  if (platform === 'instagram') {
    content = generateInstagramPost(prompt, context, { isRecipe, isTip, isQuestion, isPersonal })
    hashtags = generateInstagramHashtags(prompt, context.hashtags)
    suggestions = [
      'Consider adding a recipe card image',
      'Story polls work great for engagement',
      'Tag relevant food accounts for reach'
    ]
  } else if (platform === 'facebook') {
    content = generateFacebookPost(prompt, context, { isRecipe, isTip, isQuestion, isPersonal })
    hashtags = generateFacebookHashtags(prompt, context.hashtags)
    suggestions = [
      'Facebook favors longer, story-driven content',
      'Ask questions to boost engagement',
      'Consider creating a Facebook event for cooking sessions'
    ]
  } else if (platform === 'twitter') {
    content = generateTwitterPost(prompt, context, { isRecipe, isTip, isQuestion, isPersonal })
    hashtags = generateTwitterHashtags(prompt, context.hashtags)
    suggestions = [
      'Keep under 280 characters',
      'Twitter threads work well for recipes',
      'Quote tweet food trends'
    ]
  } else {
    // Generic post
    content = generateGenericPost(prompt, context)
    hashtags = context.hashtags
    suggestions = [`Optimize for ${platform} when ready to post`]
  }

  return { content, hashtags, suggestions }
}

function generateInstagramPost(prompt: string, context: any, flags: any) {
  const isGritCollective = context.hashtags.includes('#gritcollectiveco')
  
  if (isGritCollective) {
    if (flags.isPersonal) {
      return `${prompt} ✨

Setting the mood and sparking those perfect moments 🕯️ 

Every piece tells a story - what's yours today?

${context.hashtags.slice(0, 10).join(' ')}`
    } else if (flags.isQuestion) {
      return `${prompt}

Drop your answer below 👇 We love hearing from our amazing community!

Remember: Grit happens when you embrace every moment 💪

${context.hashtags.slice(0, 8).join(' ')}`
    } else {
      // Use the actual user input as the main content
      return `${prompt}

Handmade with love, designed to inspire your everyday moments ✨

${context.hashtags.slice(0, 10).join(' ')}`
    }
  }
  
  if (flags.isRecipe) {
    return `🍽️ ${prompt}

This is such a game-changer for busy days! I love how simple ingredients can create something so delicious. Perfect when you want a homemade meal without spending hours in the kitchen.

✨ Quick to make, even quicker to disappear! 
⏰ Ready in under 30 minutes
🥘 Perfect for weeknight dinners

Have you tried something like this before? What's your go-to quick meal? Let me know below! ⬇️

#dailydishdash #quickmeals #easyrecipes #homecooking #foodie`
  } else if (flags.isTip) {
    return `💡 Kitchen Tip: ${prompt}

This little trick has saved me so much time in the kitchen! Try it out and let me know how it works for you 👇

#kitchentips #cookinglife #foodhacks`
  } else if (flags.isQuestion) {
    return `🤔 ${prompt}

I'm curious to hear your thoughts on this! Drop your answers in the comments - I love learning from this amazing food community! 

#foodcommunity #discussion #cooking`
  } else {
    return `${prompt} 🍴

I'm excited to share this with you! There's something special about simple, delicious food that brings people together.

What do you think? Would you give this a try? Drop a comment and let me know! 👇

#dailydishdash #foodlife #cooking #foodlover`
  }
}

function generateFacebookPost(prompt: string, context: any, flags: any) {
  const isGritCollective = context.hashtags.includes('#gritcollectiveco')
  
  if (isGritCollective) {
    if (flags.isPersonal) {
      return `${prompt}

There's something special about the little moments that make up our day. Whether it's lighting a candle after a long day, sipping coffee from a mug that speaks to your soul, or adding that perfect piece of wall art that ties your space together - these are the moments that matter.

At Grit Collective Co., we believe in creating products that don't just fill spaces, but inspire them. Each piece is handmade with intention, designed to spark joy and remind you that grit happens when you embrace life fully.

What moment are you creating today? 🕯️✨

Shop our collection at gritcollectiveco.com`
    } else if (flags.isQuestion) {
      return `${prompt}

We'd love to hear your thoughts! Our community is filled with amazing people who inspire us every day. 

Drop your answer in the comments below - let's start a conversation! 👇

Remember: Every day is a chance to set the mood and spark new moments. #GritHappens`
    } else {
      return `${prompt}

Every piece in our collection tells a story - handcrafted with intention to inspire your everyday moments. We believe in creating products that don't just fill spaces, but elevate them.

✨ Handmade with love
🏠 Designed to inspire
💪 Because grit happens

Visit us at gritcollectiveco.com to explore the full collection.`
    }
  }
  
  if (flags.isRecipe) {
    return `🍳 ${prompt}

I've been perfecting this recipe for weeks, and I'm finally ready to share it with you! It's become our family's go-to dinner when we're all busy but still want something delicious and homemade.

The best part? You probably have most of these ingredients already in your pantry. There's something so satisfying about creating a amazing meal with what you already have on hand.

I'd love to hear how it turns out if you give it a try! And if you have any questions about substitutions or cooking techniques, just ask - I'm here to help make your kitchen adventures successful! 😊

What's your current favorite quick dinner recipe? I'm always looking for new ideas to try!`
  } else if (flags.isTip) {
    return `💡 ${prompt}

I wish someone had told me this years ago! It's amazing how small changes in the kitchen can make such a big difference in both taste and efficiency.

This tip has honestly transformed how I approach cooking, especially on those hectic weekdays when I'm trying to get dinner on the table while juggling everything else life throws at us.

Have you tried anything like this before? I'd love to hear your favorite kitchen hacks - we can all learn from each other! 👇`
  } else {
    return `${prompt}

I'd love to hear your thoughts on this! What's on your mind in the kitchen today?`
  }
}

function generateTwitterPost(prompt: string, context: any, flags: any) {
  if (flags.isRecipe) {
    return `🍽️ ${prompt.substring(0, 180)}... 

Quick recipe thread coming up! ⬇️ Perfect for busy weeknights.

#quickmeals #recipe #cooking`
  } else if (flags.isTip) {
    return `💡 Kitchen tip: ${prompt.substring(0, 200)}

Game changer! 🙌

#kitchentips #cooking #foodhacks`
  } else {
    return `${prompt.substring(0, 200)}

Thoughts? 🤔

#dailydishdash #cooking #foodie`
  }
}

function generateGenericPost(prompt: string, context: any) {
  return `${prompt}

${context.hashtags.slice(0, 5).join(' ')}`
}

function generateInstagramHashtags(prompt: string, baseHashtags: string[]) {
  const additionalHashtags = []
  
  if (/recipe|cooking/i.test(prompt)) {
    additionalHashtags.push('#recipe', '#homecooking', '#foodprep')
  }
  if (/quick|fast|easy/i.test(prompt)) {
    additionalHashtags.push('#quickmeals', '#easyrecipes', '#mealprep')
  }
  if (/healthy/i.test(prompt)) {
    additionalHashtags.push('#healthyeating', '#wellness', '#nutritious')
  }
  if (/breakfast/i.test(prompt)) {
    additionalHashtags.push('#breakfast', '#morningfuel', '#brunch')
  }
  if (/lunch|dinner/i.test(prompt)) {
    additionalHashtags.push('#dinnertime', '#familymeal', '#homemade')
  }

  return [...baseHashtags, ...additionalHashtags].slice(0, 15)
}

function generateFacebookHashtags(prompt: string, baseHashtags: string[]) {
  // Facebook uses fewer hashtags
  return baseHashtags.slice(0, 5)
}

function generateTwitterHashtags(prompt: string, baseHashtags: string[]) {
  // Twitter hashtags are more concise
  const twitterTags = []
  
  if (/recipe/i.test(prompt)) twitterTags.push('#recipe')
  if (/quick/i.test(prompt)) twitterTags.push('#quickmeals')
  if (/tip/i.test(prompt)) twitterTags.push('#cookingtips')
  
  return [...baseHashtags.slice(0, 2), ...twitterTags].slice(0, 5)
}
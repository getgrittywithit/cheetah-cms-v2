import { NextRequest, NextResponse } from 'next/server'

interface GeneratePostRequest {
  prompt: string
  brand: string
  platforms: string[]
  tone?: string
  style?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received request body:', body)
    
    const { prompt, brand, platforms, tone, style }: GeneratePostRequest = body

    if (!prompt || !brand || !platforms || platforms.length === 0) {
      console.log('Missing required fields:', { prompt: !!prompt, brand: !!brand, platforms: platforms?.length })
      return NextResponse.json(
        { error: 'Prompt, brand, and platforms are required' },
        { status: 400 }
      )
    }

    console.log('Generating posts for platforms:', platforms)
    
    // For now, we'll create a smart template-based generator
    // Later this can be connected to OpenAI, Claude, or other AI services
    const generatedPosts = platforms.map(platform => {
      console.log('Generating for platform:', platform)
      const post = generatePostForPlatform(prompt, brand, platform, tone, style)
      return {
        platform,
        content: post.content,
        hashtags: post.hashtags,
        suggestions: post.suggestions
      }
    })

    console.log('Generated posts:', generatedPosts.length)

    return NextResponse.json({
      success: true,
      posts: generatedPosts,
      originalPrompt: prompt
    })
  } catch (error) {
    console.error('AI generation error:', error)
    return NextResponse.json(
      { error: `Failed to generate posts: ${error}` },
      { status: 500 }
    )
  }
}

function generatePostForPlatform(prompt: string, brand: string, platform: string, tone?: string, style?: string) {
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

Here's a quick and delicious recipe that'll save you time in the kitchen! Perfect for busy weeknights when you want something tasty without the hassle.

👩‍🍳 Prep time: 15 mins
⏰ Cook time: 20 mins
😋 Serves: 4

What's your favorite quick meal when you're short on time? Let me know in the comments! ⬇️

#quickrecipes #easymeals #foodie #cooking`
  } else if (flags.isTip) {
    return `💡 Kitchen Tip: ${prompt}

This little trick has saved me so much time in the kitchen! Try it out and let me know how it works for you 👇

#kitchentips #cookinglife #foodhacks`
  } else if (flags.isQuestion) {
    return `🤔 ${prompt}

I'm curious to hear your thoughts on this! Drop your answers in the comments - I love learning from this amazing food community! 

#foodcommunity #discussion #cooking`
  } else {
    return `${prompt}

What do you think? Share your thoughts in the comments! 

#dailydishdash #foodlife #cooking`
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
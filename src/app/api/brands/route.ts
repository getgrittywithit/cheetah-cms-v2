import { NextRequest, NextResponse } from 'next/server'
import { Brand } from '@/lib/brand-types'

// Server-side brand configurations with environment variables
const getBrands = (): Brand[] => [
  {
    id: '1',
    name: 'Grit Collective',
    slug: 'grit-collective',
    description: 'Premium streetwear and lifestyle brand',
    website: 'https://gritcollective.com',
    industry: 'Fashion & Apparel',
    targetAudience: 'Young adults 18-35 interested in streetwear and urban fashion',
    socialAccounts: [
      {
        platform: 'facebook',
        accountId: 'grit-collective-fb',
        accessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '',
        pageId: process.env.FACEBOOK_PAGE_ID || '',
        username: 'gritcollective',
        isActive: true
      },
      {
        platform: 'instagram',
        accountId: 'grit-collective-ig',
        accessToken: process.env.INSTAGRAM_ACCESS_TOKEN || '',
        username: 'gritcollective',
        isActive: true
      }
    ],
    guidelines: {
      voice: {
        tone: 'Bold, authentic, and empowering',
        personality: ['Confident', 'Edgy', 'Inclusive', 'Motivational'],
        doNots: ['Avoid overly corporate language', 'Don\'t use outdated slang', 'Never compromise on quality messaging']
      },
      visual: {
        primaryColors: ['#000000', '#FFFFFF'],
        secondaryColors: ['#FF6B35', '#F7931E'],
        fontStyle: 'Bold, modern sans-serif'
      },
      content: {
        hashtags: ['#GritCollective', '#StreetWear', '#UrbanFashion', '#BoldStyle', '#AuthenticVibes'],
        keywords: ['streetwear', 'urban fashion', 'bold style', 'premium apparel'],
        contentPillars: ['Product Showcases', 'Style Inspiration', 'Behind the Scenes', 'Community Features'],
        postingSchedule: [
          {
            platform: 'instagram',
            times: ['9:00 AM', '3:00 PM', '7:00 PM'],
            frequency: 'daily'
          },
          {
            platform: 'facebook',
            times: ['10:00 AM', '6:00 PM'],
            frequency: '5x per week'
          }
        ]
      },
      aiPrompt: 'You are the social media voice for Grit Collective, a premium streetwear brand. Write content that is bold, authentic, and empowering. Focus on style inspiration, product features, and building community. Use urban language that resonates with young adults who value self-expression and quality fashion.'
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'Daily Dish Dash',
    slug: 'daily-dish-dash',
    description: 'Quick, delicious recipes and food inspiration for busy people',
    website: 'https://dailydishdash.com',
    industry: 'Food & Cooking',
    targetAudience: 'Busy professionals and home cooks looking for quick, tasty meal solutions',
    socialAccounts: [
      {
        platform: 'facebook',
        accountId: 'daily-dish-dash-fb',
        accessToken: process.env.DAILY_DISH_FACEBOOK_PAGE_ACCESS_TOKEN || '',
        pageId: process.env.DAILY_DISH_FACEBOOK_PAGE_ID || '',
        username: 'dailydishdash',
        isActive: true
      },
      {
        platform: 'instagram',
        accountId: 'daily-dish-dash-ig',
        accessToken: process.env.DAILY_DISH_INSTAGRAM_ACCESS_TOKEN || '',
        username: 'dailydishdash',
        isActive: true
      },
      {
        platform: 'tiktok',
        accountId: 'daily-dish-dash-tiktok',
        accessToken: process.env.DAILY_DISH_TIKTOK_ACCESS_TOKEN || '',
        username: 'dailydishdash',
        isActive: true
      }
    ],
    guidelines: {
      voice: {
        tone: 'Friendly, helpful, and enthusiastic about food',
        personality: ['Approachable', 'Encouraging', 'Practical', 'Food-passionate'],
        doNots: ['Don\'t use complex culinary terms', 'Avoid time-consuming recipes', 'Don\'t shame food choices']
      },
      visual: {
        primaryColors: ['#FF6B6B', '#4ECDC4'],
        secondaryColors: ['#45B7D1', '#96CEB4', '#FFEAA7'],
        fontStyle: 'Friendly, rounded fonts'
      },
      content: {
        hashtags: ['#DailyDishDash', '#QuickRecipes', '#EasyMeals', '#FoodHacks', '#BusyCook', '#HomeCooking'],
        keywords: ['quick recipes', 'easy meals', 'cooking tips', 'food hacks', 'meal prep'],
        contentPillars: ['Quick Recipes', 'Cooking Tips', 'Meal Prep Ideas', 'Food Hacks', 'Kitchen Gadgets'],
        postingSchedule: [
          {
            platform: 'instagram',
            times: ['8:00 AM', '12:00 PM', '6:00 PM'],
            frequency: 'daily'
          },
          {
            platform: 'facebook',
            times: ['9:00 AM', '5:00 PM'],
            frequency: 'daily'
          },
          {
            platform: 'tiktok',
            times: ['11:00 AM', '4:00 PM', '8:00 PM'],
            frequency: '2x per day'
          }
        ]
      },
      aiPrompt: 'You are the social media voice for Daily Dish Dash, a food brand focused on quick, delicious recipes for busy people. Write content that is friendly, encouraging, and practical. Share cooking tips, easy recipes, and food hacks that save time. Make cooking feel accessible and fun, not intimidating. Use warm, conversational language that makes followers feel like they\'re getting advice from a helpful friend in the kitchen.'
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

export async function GET() {
  try {
    const brands = getBrands()
    
    // Log to check if env vars are loaded
    console.log('Daily Dish FB Token exists:', !!process.env.DAILY_DISH_FACEBOOK_PAGE_ACCESS_TOKEN)
    console.log('Daily Dish FB Page ID:', process.env.DAILY_DISH_FACEBOOK_PAGE_ID)
    
    return NextResponse.json({
      success: true,
      brands
    })
  } catch (error) {
    console.error('Failed to get brands:', error)
    return NextResponse.json(
      { error: 'Failed to get brands' },
      { status: 500 }
    )
  }
}
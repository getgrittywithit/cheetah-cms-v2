import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brandId = searchParams.get('brandId')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (brandId) {
      query = query.eq('brand_id', brandId)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: posts, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch blog posts' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      posts: posts || []
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      title, 
      content, 
      excerpt, 
      tags, 
      status, 
      scheduledFor, 
      brandId 
    } = await request.json()

    if (!title || !content || !brandId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Title, content, and brand ID are required' 
      }, { status: 400 })
    }

    const wordCount = content.split(/\s+/).length
    const readTime = Math.ceil(wordCount / 200) // ~200 words per minute

    const blogPost = {
      title,
      content,
      excerpt: excerpt || '',
      tags: tags || [],
      status: status || 'draft',
      scheduled_for: scheduledFor ? new Date(scheduledFor).toISOString() : null,
      brand_id: brandId,
      word_count: wordCount,
      read_time: readTime,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // If publishing immediately, set published_at
    if (status === 'published') {
      blogPost.published_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .insert([blogPost])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to save blog post' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      post: data
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
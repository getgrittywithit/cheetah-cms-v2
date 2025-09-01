import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getBrandConfig } from '@/lib/brand-config'

// GET orders for a brand
export async function GET(
  request: NextRequest,
  { params }: { params: { brand: string } }
) {
  try {
    const brandConfig = getBrandConfig(params.brand)
    if (!brandConfig) {
      return NextResponse.json({ success: false, error: 'Invalid brand' }, { status: 404 })
    }

    // Get brand profile
    const { data: brandProfile } = await supabaseAdmin
      .from('brand_profiles')
      .select('id')
      .eq('slug', params.brand)
      .single()

    if (!brandProfile) {
      return NextResponse.json({ success: false, error: 'Brand not found' }, { status: 404 })
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabaseAdmin
      .from('orders')
      .select('*')
      .eq('brand_profile_id', brandProfile.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply status filter
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: orders, error } = await query

    if (error) {
      console.error('Error fetching orders:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch orders' 
      }, { status: 500 })
    }

    // Get order stats
    const { data: stats } = await supabaseAdmin
      .from('orders')
      .select('status, total_amount')
      .eq('brand_profile_id', brandProfile.id)

    const orderStats = {
      total: stats?.length || 0,
      pending: stats?.filter(o => o.status === 'pending').length || 0,
      paid: stats?.filter(o => o.status === 'paid').length || 0,
      fulfilled: stats?.filter(o => o.status === 'fulfilled').length || 0,
      revenue: stats?.filter(o => o.status === 'paid').reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0
    }

    return NextResponse.json({ 
      success: true, 
      orders: orders || [],
      stats: orderStats,
      pagination: {
        limit,
        offset,
        total: stats?.length || 0
      }
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
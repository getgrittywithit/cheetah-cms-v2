import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getBrandConfig } from '@/lib/brand-config'

// PUT update a category
export async function PUT(
  request: NextRequest,
  { params }: { params: { brand: string; id: string } }
) {
  try {
    const brandConfig = getBrandConfig(params.brand)
    if (!brandConfig) {
      return NextResponse.json({ success: false, error: 'Invalid brand' }, { status: 404 })
    }

    const body = await request.json()
    const { name, slug, description, parent_id, sort_order } = body

    // Get brand profile
    const { data: brandProfile } = await supabaseAdmin
      .from('brand_profiles')
      .select('id')
      .eq('slug', params.brand)
      .single()

    if (!brandProfile) {
      return NextResponse.json({ success: false, error: 'Brand not found' }, { status: 404 })
    }

    // Update category
    const { data: category, error } = await supabaseAdmin
      .from('categories')
      .update({
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description,
        parent_id,
        sort_order: sort_order || 0
      })
      .eq('id', params.id)
      .eq('brand_profile_id', brandProfile.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating category:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to update category',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      category 
    })
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

// DELETE a category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { brand: string; id: string } }
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

    // Check if category has children
    const { data: children } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('parent_id', params.id)
      .eq('brand_profile_id', brandProfile.id)

    if (children && children.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot delete category with subcategories' 
      }, { status: 400 })
    }

    // Delete category
    const { error } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', params.id)
      .eq('brand_profile_id', brandProfile.id)

    if (error) {
      console.error('Error deleting category:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to delete category',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true 
    })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}
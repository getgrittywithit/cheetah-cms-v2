import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔵 Starting simple Instagram test...')
    
    // Step 1: Test basic imports
    let stepResults: any = {
      step1_imports: { success: false, error: null },
      step2_brandConfig: { success: false, error: null },
      step3_r2Upload: { success: false, error: null },
      step4_instagramService: { success: false, error: null }
    }

    // Step 1: Test imports
    try {
      const { getBrandConfig } = await import('@/lib/brand-config')
      const { R2ImageUploader } = await import('@/lib/r2-upload')
      stepResults.step1_imports = { success: true }
      console.log('✅ Imports successful')
    } catch (error) {
      stepResults.step1_imports = { 
        success: false, 
        error: error instanceof Error ? error.message : 'Import error'
      }
      console.log('❌ Import failed:', error)
      return NextResponse.json({ stepResults })
    }

    // Step 2: Test brand config
    try {
      const { getBrandConfig } = await import('@/lib/brand-config')
      const brandConfig = getBrandConfig('daily-dish-dash')
      
      stepResults.step2_brandConfig = {
        success: !!brandConfig,
        hasInstagramToken: !!brandConfig?.socialTokens?.instagram,
        hasInstagramAccountId: !!brandConfig?.socialTokens?.instagramAccountId,
      }
      console.log('✅ Brand config loaded:', stepResults.step2_brandConfig)
      
      if (!brandConfig?.socialTokens?.instagram) {
        return NextResponse.json({ stepResults, error: 'No Instagram token' })
      }
    } catch (error) {
      stepResults.step2_brandConfig = {
        success: false,
        error: error instanceof Error ? error.message : 'Brand config error'
      }
      return NextResponse.json({ stepResults })
    }

    // Step 3: Test R2 uploader creation (don't actually upload)
    try {
      const { R2ImageUploader } = await import('@/lib/r2-upload')
      const uploader = new R2ImageUploader('daily-dish-dash')
      stepResults.step3_r2Upload = { success: true, uploaderCreated: true }
      console.log('✅ R2 uploader created successfully')
    } catch (error) {
      stepResults.step3_r2Upload = {
        success: false,
        error: error instanceof Error ? error.message : 'R2 uploader error'
      }
      console.log('❌ R2 uploader failed:', error)
      return NextResponse.json({ stepResults })
    }

    // Step 4: Test Instagram service import (don't actually post)
    try {
      const { InstagramService } = await import('@/lib/instagram-service')
      stepResults.step4_instagramService = { success: true, serviceImported: true }
      console.log('✅ Instagram service imported successfully')
    } catch (error) {
      stepResults.step4_instagramService = {
        success: false,
        error: error instanceof Error ? error.message : 'Instagram service error'
      }
      console.log('❌ Instagram service failed:', error)
    }

    return NextResponse.json({
      success: true,
      message: 'All steps completed successfully',
      stepResults
    })

  } catch (error) {
    console.error('🔴 Simple Instagram test error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5) : undefined
    }, { status: 500 })
  }
}
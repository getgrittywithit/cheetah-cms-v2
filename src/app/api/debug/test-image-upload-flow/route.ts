import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get brandSlug from query params
    const { searchParams } = new URL(request.url)
    const brandSlug = searchParams.get('brand') || 'daily-dish-dash'
    
    // Test data
    const testImageUrl = 'https://via.placeholder.com/1080x1080.png?text=Test+Image'
    const testCaption = 'Test post from image upload flow verification'
    const testHashtags = ['#test', '#imageupload', '#r2storage']
    
    return NextResponse.json({
      success: true,
      message: 'Image upload flow test endpoint',
      instructions: [
        '1. Upload an image using the AI Post Creator',
        '2. The image should be uploaded to R2 and return a public URL',
        '3. The public URL should be passed to Instagram/Facebook APIs',
        '4. Check the console logs for the flow:',
        '   - "🟢 Image uploaded to R2: [URL]" in the browser console',
        '   - "🔵 Using existing public URL: [URL]" in the server logs',
        '5. The APIs should receive URLs like: https://[brand-domain]/[path]',
        '   NOT blob:// URLs'
      ],
      testData: {
        brandSlug,
        testImageUrl,
        testCaption,
        testHashtags
      },
      expectedFlow: {
        step1: 'User selects image file',
        step2: 'handleImageUpload() uploads to /api/brand-files/[brand]/upload',
        step3: 'R2 returns public URL like: https://media.dailydishdash.com/social-media/...',
        step4: 'Public URL is stored in component state',
        step5: 'When publishing, public URL is sent to /api/marketing/publish-multi',
        step6: 'Instagram/Facebook APIs receive the public URL'
      }
    })
  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
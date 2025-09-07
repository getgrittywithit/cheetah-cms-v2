import { PrintfulAPI } from './printful-api'

export class PrintfulMockupAPI extends PrintfulAPI {
  // Upload design file to Printful
  async uploadDesignFile(fileUrl: string, filename: string) {
    try {
      const response = await this.makeRequest('/files', {
        method: 'POST',
        body: JSON.stringify({
          url: fileUrl,
          filename: filename,
          type: 'default'
        })
      })
      return response.result
    } catch (error) {
      console.error('Failed to upload design file:', error)
      throw error
    }
  }

  // Generate mockups for a product
  async generateMockups(productId: string, fileId: string, placement: string = 'front') {
    try {
      // Create mockup generation task
      const taskResponse = await this.makeRequest(`/mockup-generator/create-task/${productId}`, {
        method: 'POST',
        body: JSON.stringify({
          variant_ids: [], // Empty array generates for all variants
          files: [
            {
              placement,
              image_url: `https://files.cdn.printful.com/files/${fileId}`,
              position: {
                area_width: 1800,
                area_height: 2400,
                width: 1800,
                height: 2400,
                top: 0,
                left: 0
              }
            }
          ]
        })
      })

      const taskKey = taskResponse.result.task_key
      
      // Poll for task completion
      let attempts = 0
      while (attempts < 30) { // Max 30 attempts (30 seconds)
        await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
        
        const statusResponse = await this.makeRequest(`/mockup-generator/task?task_key=${taskKey}`)
        
        if (statusResponse.result.status === 'completed') {
          return statusResponse.result.mockups
        } else if (statusResponse.result.status === 'failed') {
          throw new Error('Mockup generation failed')
        }
        
        attempts++
      }
      
      throw new Error('Mockup generation timeout')
    } catch (error) {
      console.error('Failed to generate mockups:', error)
      throw error
    }
  }

  // Get printfile templates for a product
  async getPrintfiles(productId: string) {
    try {
      const response = await this.makeRequest(`/mockup-generator/printfiles/${productId}`)
      return response.result
    } catch (error) {
      console.error('Failed to get printfiles:', error)
      throw error
    }
  }
}

export const printfulMockupAPI = new PrintfulMockupAPI()
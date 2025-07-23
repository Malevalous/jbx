import api from './api'

export const platformsService = {
  async getPlatforms() {
    try {
      const response = await api.get('/platforms')
      return response.data
    } catch (error) {
      console.error('Error fetching platforms:', error)
      throw new Error('Failed to fetch platforms')
    }
  },

  async updatePlatform(platformId, config) {
    try {
      const response = await api.put(`/platforms/${platformId}`, config)
      return response.data
    } catch (error) {
      console.error('Error updating platform:', error)
      throw new Error('Failed to update platform configuration')
    }
  },

  async testPlatformConnection(platformId) {
    try {
      const response = await api.post(`/platforms/${platformId}/test`)
      return response.data
    } catch (error) {
      console.error('Error testing platform connection:', error)
      throw new Error('Failed to test platform connection')
    }
  },

  async enablePlatform(platformId) {
    try {
      const response = await api.patch(`/platforms/${platformId}/enable`)
      return response.data
    } catch (error) {
      console.error('Error enabling platform:', error)
      throw new Error('Failed to enable platform')
    }
  },

  async disablePlatform(platformId) {
    try {
      const response = await api.patch(`/platforms/${platformId}/disable`)
      return response.data
    } catch (error) {
      console.error('Error disabling platform:', error)
      throw new Error('Failed to disable platform')
    }
  }
}

export default platformsService
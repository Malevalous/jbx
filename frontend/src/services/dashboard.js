import api from './api'

export const dashboardService = {
  async getStats() {
    try {
      const response = await api.get('/dashboard/stats')
      return response.data
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      throw new Error('Failed to fetch dashboard statistics')
    }
  },

  async getRecentApplications(limit = 10) {
    try {
      const response = await api.get(`/applications/recent?limit=${limit}`)
      return response.data
    } catch (error) {
      console.error('Error fetching recent applications:', error)
      throw new Error('Failed to fetch recent applications')
    }
  },

  async getApplicationTrends(period = '7d') {
    try {
      const response = await api.get(`/dashboard/trends?period=${period}`)
      return response.data
    } catch (error) {
      console.error('Error fetching application trends:', error)
      throw new Error('Failed to fetch application trends')
    }
  },

  async getPlatformStats() {
    try {
      const response = await api.get('/dashboard/platforms')
      return response.data
    } catch (error) {
      console.error('Error fetching platform stats:', error)
      throw new Error('Failed to fetch platform statistics')
    }
  },

  async getSystemHealth() {
    try {
      const response = await api.get('/dashboard/health')
      return response.data
    } catch (error) {
      console.error('Error fetching system health:', error)
      throw new Error('Failed to fetch system health')
    }
  },

  async getJobQueueStatus() {
    try {
      const response = await api.get('/dashboard/queue-status')
      return response.data
    } catch (error) {
      console.error('Error fetching queue status:', error)
      throw new Error('Failed to fetch job queue status')
    }
  }
}

// Default export for backward compatibility
export default dashboardService

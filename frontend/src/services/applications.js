import api from './api'

export const applicationsService = {
  async getApplications(params = {}) {
    try {
      const { page = 1, limit = 20, status, platform, dateRange } = params
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status }),
        ...(platform && { platform }),
        ...(dateRange && { dateRange })
      })

      const response = await api.get(`/applications?${queryParams}`)
      return response.data
    } catch (error) {
      console.error('Error fetching applications:', error)
      throw new Error('Failed to fetch applications')
    }
  },

  async getApplicationById(id) {
    try {
      const response = await api.get(`/applications/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching application:', error)
      throw new Error('Failed to fetch application details')
    }
  },

  async updateApplicationStatus(id, status) {
    try {
      const response = await api.patch(`/applications/${id}/status`, { status })
      return response.data
    } catch (error) {
      console.error('Error updating application status:', error)
      throw new Error('Failed to update application status')
    }
  },

  async retryApplication(id) {
    try {
      const response = await api.post(`/applications/${id}/retry`)
      return response.data
    } catch (error) {
      console.error('Error retrying application:', error)
      throw new Error('Failed to retry application')
    }
  },

  async deleteApplication(id) {
    try {
      const response = await api.delete(`/applications/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting application:', error)
      throw new Error('Failed to delete application')
    }
  },

  async exportApplications(params = {}) {
    try {
      const response = await api.get('/applications/export', {
        params,
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      console.error('Error exporting applications:', error)
      throw new Error('Failed to export applications')
    }
  }
}
export default applicationsService
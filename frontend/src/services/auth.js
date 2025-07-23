import api from './api'

export const authService = {
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password })
      return response.data
    } catch (error) {
      console.error('Login error:', error)
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  },

  async register(name, email, password) {
    try {
      const response = await api.post('/auth/register', { name, email, password })
      return response.data
    } catch (error) {
      console.error('Registration error:', error)
      throw new Error(error.response?.data?.message || 'Registration failed')
    }
  },

  async validateToken(token) {
    try {
      const response = await api.get('/auth/validate', {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      console.error('Token validation error:', error)
      throw new Error('Invalid token')
    }
  },

  async refreshToken() {
    try {
      const response = await api.post('/auth/refresh')
      return response.data
    } catch (error) {
      console.error('Token refresh error:', error)
      throw new Error('Token refresh failed')
    }
  },

  async logout() {
    try {
      await api.post('/auth/logout')
      localStorage.removeItem('token')
      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      // Still remove token even if API call fails
      localStorage.removeItem('token')
      return { success: true }
    }
  },

  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email })
      return response.data
    } catch (error) {
      console.error('Forgot password error:', error)
      throw new Error(error.response?.data?.message || 'Password reset failed')
    }
  },

  async resetPassword(token, password) {
    try {
      const response = await api.post('/auth/reset-password', { token, password })
      return response.data
    } catch (error) {
      console.error('Reset password error:', error)
      throw new Error(error.response?.data?.message || 'Password reset failed')
    }
  },

  async updateProfile(profileData) {
    try {
      const response = await api.put('/auth/profile', profileData)
      return response.data
    } catch (error) {
      console.error('Profile update error:', error)
      throw new Error(error.response?.data?.message || 'Profile update failed')
    }
  },

  async changePassword(currentPassword, newPassword) {
    try {
      const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      })
      return response.data
    } catch (error) {
      console.error('Change password error:', error)
      throw new Error(error.response?.data?.message || 'Password change failed')
    }
  }
}

// Default export for backward compatibility
export default authService

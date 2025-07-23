import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/auth'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      authService.validateToken(token)
        .then(userData => {
          setUser(userData.user || userData)
        })
        .catch(() => {
          localStorage.removeItem('token')
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password)
      const { user, token } = response
      
      if (token) {
        localStorage.setItem('token', token)
      }
      
      setUser(user)
      return user
    } catch (error) {
      throw error
    }
  }

  const register = async (name, email, password) => {
    try {
      const response = await authService.register(name, email, password)
      const { user, token } = response
      
      if (token) {
        localStorage.setItem('token', token)
      }
      
      setUser(user)
      return user
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      setUser(null)
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

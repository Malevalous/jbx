import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AuthProvider, { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
import Dashboard from './components/Dashboard/Dashboard'
import Applications from './components/Applications/Applications'
import Platforms from './components/Platforms/Platforms'
import Settings from './components/Settings/Settings'
import './App.css'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) return <div className="flex justify-center items-center h-screen">
    <div className="loading-spinner"></div>
  </div>
  if (!user) return <Navigate to="/login" />
  
  return children
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/applications" element={
            <ProtectedRoute>
              <Layout>
                <Applications />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/platforms" element={
            <ProtectedRoute>
              <Layout>
                <Platforms />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App

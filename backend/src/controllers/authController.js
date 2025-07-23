const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { validationResult } = require('express-validator')
const logger = require('../config/logging').setupLogging()

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

const register = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      })
    }

    const { name, email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists with this email'
      })
    }

    // Create new user
    const user = new User({
      name,
      email,
      password
    })

    await user.save()

    // Generate token
    const token = generateToken(user._id)

    // Log successful registration
    logger.info(`New user registered: ${email}`)

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    logger.error('Registration error:', error)
    res.status(500).json({
      error: 'Internal server error during registration'
    })
  }
}

const login = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      })
    }

    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password'
      })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid email or password'
      })
    }

    // Update last login
    user.lastLoginAt = new Date()
    await user.save()

    // Generate token
    const token = generateToken(user._id)

    // Log successful login
    logger.info(`User logged in: ${email}`)

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    logger.error('Login error:', error)
    res.status(500).json({
      error: 'Internal server error during login'
    })
  }
}

const validateToken = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(401).json({
        error: 'User not found'
      })
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    logger.error('Token validation error:', error)
    res.status(500).json({
      error: 'Internal server error during token validation'
    })
  }
}

const refreshToken = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(401).json({
        error: 'User not found'
      })
    }

    const token = generateToken(user._id)

    res.json({
      message: 'Token refreshed successfully',
      token
    })
  } catch (error) {
    logger.error('Token refresh error:', error)
    res.status(500).json({
      error: 'Internal server error during token refresh'
    })
  }
}

module.exports = {
  register,
  login,
  validateToken,
  refreshToken
}

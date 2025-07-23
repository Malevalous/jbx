const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const compression = require('compression')
const rateLimit = require('express-rate-limit')
const morgan = require('morgan')
require('dotenv').config()

const { connectDatabases } = require('./config/database')
const { setupRedis } = require('./config/redis')
const { setupRabbitMQ } = require('./config/rabbitmq')
const routes = require('./routes')
const { errorHandler } = require('./middleware/errorHandler')
const { setupLogging } = require('./config/logging')

const app = express()
const PORT = process.env.PORT || 4000

// Setup logging
const logger = setupLogging()

// Security middleware
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production'
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})
app.use('/api/', limiter)

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}))

// Compression and parsing
app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }))

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  })
})

// API routes
app.use('/api', routes)

// Error handling
app.use(errorHandler)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

async function startServer() {
  try {
    // Connect to databases
    await connectDatabases()
    logger.info('Databases connected successfully')

    // Setup Redis
    await setupRedis()
    logger.info('Redis connected successfully')

    // Setup RabbitMQ
    await setupRabbitMQ()
    logger.info('RabbitMQ connected successfully')

    // Start server
    app.listen(PORT, () => {
      logger.info(`JBX Backend server running on port ${PORT}`)
      logger.info(`Environment: ${process.env.NODE_ENV}`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully')
  process.exit(0)
})

startServer()

module.exports = app

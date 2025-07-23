const { chromium } = require('playwright')
const amqp = require('amqplib')
const Redis = require('ioredis')
const winston = require('winston')
const UserAgent = require('user-agents')
require('dotenv').config()

const { chromium } = require('playwright-extra')
const stealth = require('puppeteer-extra-plugin-stealth')()
// Import platform adapters
const LinkedInAdapter = require('./adapters/LinkedInAdapter')
const IndeedAdapter = require('./adapters/IndeedAdapter')
const NaukriAdapter = require('./adapters/NaukriAdapter')
const MonsterAdapter = require('./adapters/MonsterAdapter')
const GlassdoorAdapter = require('./adapters/GlassdoorAdapter')

// Setup logging
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ 
      filename: 'logs/worker-error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/worker.log' 
    })
  ]
})

class AutomationWorker {
  constructor() {
    this.browser = null
    this.page = null
    this.rabbitConnection = null
    this.rabbitChannel = null
    this.redis = null
    this.adapters = new Map()
    this.isProcessing = false
    
    this.initializeAdapters()
  }

  initializeAdapters() {
    this.adapters.set('linkedin', new LinkedInAdapter())
    this.adapters.set('indeed', new IndeedAdapter())
    this.adapters.set('naukri', new NaukriAdapter())
    this.adapters.set('monster', new MonsterAdapter())
    this.adapters.set('glassdoor', new GlassdoorAdapter())
  }

  async initialize() {
    try {
      logger.info('Initializing automation worker...')
      
      // Setup Redis
      this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        maxRetriesPerRequest: null,
      })
      
      this.redis.on('connect', () => {
        logger.info('Redis connected')
      })
      
      this.redis.on('error', (err) => {
        logger.error('Redis error:', err)
      })

      // Setup RabbitMQ
      this.rabbitConnection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost')
      this.rabbitChannel = await this.rabbitConnection.createChannel()
      
      await this.rabbitChannel.assertQueue('job_applications', { durable: true })
      await this.rabbitChannel.prefetch(1) // Process one job at a time
      
      logger.info('RabbitMQ connected')

      // Setup browser
      await this.setupBrowser()
      logger.info('Browser initialized')

      // Start consuming messages
      await this.startConsuming()
      
      logger.info('Automation worker initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize worker:', error)
      process.exit(1)
    }
  }

  async setupBrowser() {
    this.browser = await chromium.launch({
      headless: process.env.NODE_ENV === 'production',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
      ]
    })

    const context = await this.browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1366, height: 768 },
        locale: 'en-US',
        timezoneId: 'America/New_York'
    })

    this.page = await context.newPage()

    // Add stealth techniques
    await this.page.addInitScript(() => {
      // Remove webdriver property
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      })

      // Mock languages and plugins
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      })

      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      })

      // Hide automation indicators
    Object.defineProperty(navigator, 'permissions', {
      get: () => ({
        query: () => Promise.resolve({ state: 'granted' })
        
      })
    })

    // Random mouse movements
    // (This should not be inside addInitScript, move it outside)
    // The following code should be outside the addInitScript function
    })

    await this.page.mouse.move(
      Math.floor(Math.random() * 100) + 100,
      Math.floor(Math.random() * 100) + 100
    )
  }

  async startConsuming() {
    await this.rabbitChannel.consume('job_applications', async (msg) => {
      if (msg && !this.isProcessing) {
        this.isProcessing = true
        
        try {
          const jobData = JSON.parse(msg.content.toString())
          logger.info(`Processing job application: ${jobData.jobId || 'unknown'}`)
          
          await this.processJobApplication(jobData)
          this.rabbitChannel.ack(msg)
          
        } catch (error) {
          logger.error('Error processing job application:', error)
          this.rabbitChannel.nack(msg, false, false) // Don't requeue
        } finally {
          this.isProcessing = false
          
          // Random delay between applications (30-180 seconds)
          const delay = Math.random() * (180000 - 30000) + 30000
          logger.info(`Waiting ${Math.round(delay/1000)} seconds before next application`)
          await this.sleep(delay)
        }
      }
    })

    logger.info('Worker started consuming job application messages')
  }

  async processJobApplication(jobData) {
    const { platform, credentials, searchProfile, jobDetails } = jobData
    
    try {
      // Check rate limiting
      await this.checkRateLimit(platform)
      
      // Get platform adapter
      const adapter = this.adapters.get(platform.toLowerCase())
      if (!adapter) {
        throw new Error(`Unsupported platform: ${platform}`)
      }

      // Initialize adapter with page and credentials
      adapter.initialize(this.page, credentials)

      // Login to platform
      await adapter.login()
      logger.info(`Logged into ${platform}`)

      // Navigate to job and apply
      const result = await adapter.applyToJob(jobDetails)
      
      // Store result in Redis for backend to pick up
      await this.storeResult(jobData.jobId, {
        status: 'success',
        platform,
        appliedAt: new Date().toISOString(),
        result
      })

      logger.info(`Successfully applied to job ${jobData.jobId} on ${platform}`)
      
    } catch (error) {
      logger.error(`Failed to apply to job ${jobData.jobId}:`, error)
      
      await this.storeResult(jobData.jobId, {
        status: 'failed',
        platform,
        error: error.message,
        failedAt: new Date().toISOString()
      })
    }
  }

  async checkRateLimit(platform) {
    const key = `rate_limit:${platform.toLowerCase()}`
    const count = await this.redis.get(key)
    
    if (count && parseInt(count) >= 5) { // Max 5 applications per platform per hour
      throw new Error(`Rate limit exceeded for ${platform}`)
    }
    
    await this.redis.incr(key)
    await this.redis.expire(key, 3600) // 1 hour expiry
  }

  async storeResult(jobId, result) {
    const key = `job_result:${jobId}`
    await this.redis.setex(key, 3600, JSON.stringify(result)) // 1 hour expiry
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async cleanup() {
    logger.info('Starting worker cleanup...')
    
    if (this.page) {
      await this.page.close()
    }
    
    if (this.browser) {
      await this.browser.close()
    }
    
    if (this.rabbitChannel) {
      await this.rabbitChannel.close()
    }
    
    if (this.rabbitConnection) {
      await this.rabbitConnection.close()
    }
    
    if (this.redis) {
      await this.redis.quit()
    }
    
    logger.info('Worker cleanup completed')
  }
}

// Initialize and start worker
const worker = new AutomationWorker()

// Graceful shutdown handlers
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down worker')
  await worker.cleanup()
  process.exit(0)
})

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down worker')
  await worker.cleanup()
  process.exit(0)
})

process.on('uncaughtException', async (error) => {
  logger.error('Uncaught exception:', error)
  await worker.cleanup()
  process.exit(1)
})

process.on('unhandledRejection', async (reason, promise) => {
  logger.error('Unhandled rejection at:', promise, 'reason:', reason)
  await worker.cleanup()
  process.exit(1)
})

// Start worker
worker.initialize().catch(error => {
  logger.error('Failed to start worker:', error)
  process.exit(1)
})

module.exports = AutomationWorker

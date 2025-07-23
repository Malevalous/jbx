const { chromium } = require('playwright')
const stealth = require('playwright-stealth')
const amqp = require('amqplib')
const redis = require('redis')
const winston = require('winston')
const UserAgent = require('user-agents')
require('dotenv').config()

const LinkedInAdapter = require('./adapters/LinkedInAdapter')
const IndeedAdapter = require('./adapters/IndeedAdapter')
const NaukriAdapter = require('./adapters/NaukriAdapter')
const MonsterAdapter = require('./adapters/MonsterAdapter')
const GlassdoorAdapter = require('./adapters/GlassdoorAdapter')

// Setup logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/worker-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/worker.log' })
  ]
})

class AutomationWorker {
  constructor() {
    this.browser = null
    this.page = null
    this.rabbitConnection = null
    this.rabbitChannel = null
    this.redisClient = null
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
      // Setup Redis
      this.redisClient = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      })
      await this.redisClient.connect()
      logger.info('Redis connected')

      // Setup RabbitMQ
      this.rabbitConnection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost')
      this.rabbitChannel = await this.rabbitConnection.createChannel()
      
      await this.rabbitChannel.assertQueue('job_applications', { durable: true })
      logger.info('RabbitMQ connected')

      // Setup browser
      await this.setupBrowser()
      logger.info('Browser initialized')

      // Start consuming messages
      await this.startConsuming()
      
    } catch (error) {
      logger.error('Failed to initialize worker:', error)
      process.exit(1)
    }
  }

  async setupBrowser() {
    const proxyUrl = process.env.PROXY_URL
    const userAgent = new UserAgent()

    this.browser = await chromium.launch({
      headless: process.env.NODE_ENV === 'production',
      proxy: proxyUrl ? { server: proxyUrl } : undefined,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ]
    })

    const context = await this.browser.newContext({
      userAgent: userAgent.toString(),
      viewport: { width: 1366, height: 768 },
      locale: 'en-US',
      timezoneId: 'America/New_York'
    })

    this.page = await context.newPage()
    await stealth(this.page)

    // Random mouse movements to appear human-like
    await this.page.mouse.move(100, 100)
    await this.page.waitForTimeout(1000)
  }

  async startConsuming() {
    await this.rabbitChannel.prefetch(1) // Process one job at a time
    
    await this.rabbitChannel.consume('job_applications', async (msg) => {
      if (msg && !this.isProcessing) {
        this.isProcessing = true
        
        try {
          const jobData = JSON.parse(msg.content.toString())
          logger.info(`Processing job application: ${jobData.jobId}`)
          
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
          await this.page.waitForTimeout(delay)
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
      const adapter = this.adapters.get(platform)
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
    const key = `rate_limit:${platform}`
    const count = await this.redisClient.get(key)
    
    if (count && parseInt(count) >= 5) { // Max 5 applications per platform per hour
      throw new Error(`Rate limit exceeded for ${platform}`)
    }
    
    await this.redisClient.incr(key)
    await this.redisClient.expire(key, 3600) // 1 hour expiry
  }

  async storeResult(jobId, result) {
    const key = `job_result:${jobId}`
    await this.redisClient.setex(key, 3600, JSON.stringify(result)) // 1 hour expiry
  }

  async cleanup() {
    if (this.page) await this.page.close()
    if (this.browser) await this.browser.close()
    if (this.rabbitChannel) await this.rabbitChannel.close()
    if (this.rabbitConnection) await this.rabbitConnection.close()
    if (this.redisClient) await this.redisClient.quit()
    
    logger.info('Worker cleanup completed')
  }
}

// Platform adapters base class
class BasePlatformAdapter {
  constructor() {
    this.page = null
    this.credentials = null
  }

  initialize(page, credentials) {
    this.page = page
    this.credentials = credentials
  }

  async login() {
    throw new Error('Login method must be implemented by platform adapter')
  }

  async applyToJob(jobDetails) {
    throw new Error('ApplyToJob method must be implemented by platform adapter')
  }

  async waitForRandomDelay(min = 1000, max = 3000) {
    const delay = Math.random() * (max - min) + min
    await this.page.waitForTimeout(delay)
  }

  async humanTypeText(element, text, delay = 100) {
    for (let i = 0; i < text.length; i++) {
      await element.type(text[i])
      await this.page.waitForTimeout(delay + Math.random() * 50)
    }
  }
}

// Initialize and start worker
const worker = new AutomationWorker()

// Graceful shutdown
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

// Start worker
worker.initialize().catch(error => {
  logger.error('Failed to start worker:', error)
  process.exit(1)
})

module.exports = AutomationWorker

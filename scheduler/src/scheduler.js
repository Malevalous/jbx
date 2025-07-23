const cron = require('node-cron')
const mongoose = require('mongoose')
const { Sequelize, DataTypes } = require('sequelize')
const redis = require('redis')
const amqp = require('amqplib')
const winston = require('winston')
const { chromium } = require('playwright')
require('dotenv').config()

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
    new winston.transports.File({ filename: 'logs/scheduler-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/scheduler.log' })
  ]
})

class JobScheduler {
  constructor() {
    this.sequelize = null
    this.mongoose = null
    this.redisClient = null
    this.rabbitConnection = null
    this.rabbitChannel = null
    this.browser = null
    this.isRunning = false
    this.Application = null
  }

  async initialize() {
    try {
      // Connect to databases
      await this.connectDatabases()
      
      // Setup Redis
      await this.setupRedis()
      
      // Setup RabbitMQ
      await this.setupRabbitMQ()
      
      // Setup browser for status checking
      await this.setupBrowser()
      
      // Setup cron jobs
      this.setupCronJobs()
      
      logger.info('Scheduler initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize scheduler:', error)
      process.exit(1)
    }
  }

  async connectDatabases() {
    // PostgreSQL connection
    this.sequelize = new Sequelize(process.env.POSTGRES_URL, {
      dialect: 'postgres',
      logging: (msg) => logger.debug(msg),
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    })

    await this.sequelize.authenticate()
    logger.info('PostgreSQL connected successfully')

    // Define Application model
    this.Application = this.sequelize.define('Application', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      platform: {
        type: DataTypes.ENUM('linkedin', 'indeed', 'naukri', 'monster', 'glassdoor'),
        allowNull: false
      },
      platformJobId: {
        type: DataTypes.STRING,
        allowNull: false
      },
      jobTitle: {
        type: DataTypes.STRING,
        allowNull: false
      },
      company: {
        type: DataTypes.STRING,
        allowNull: false
      },
      link: {
        type: DataTypes.STRING,
        allowNull: false
      },
      appliedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      status: {
        type: DataTypes.ENUM('pending', 'applied', 'failed', 'reviewing', 'rejected', 'interview', 'offer'),
        defaultValue: 'pending'
      },
      statusCheckedAt: {
        type: DataTypes.DATE
      },
      followUpSent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      followUpSentAt: {
        type: DataTypes.DATE
      }
    }, {
      tableName: 'applications'
    })

    // MongoDB connection
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    logger.info('MongoDB connected successfully')
  }

  async setupRedis() {
    this.redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    })
    
    await this.redisClient.connect()
    logger.info('Redis connected successfully')
  }

  async setupRabbitMQ() {
    this.rabbitConnection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost')
    this.rabbitChannel = await this.rabbitConnection.createChannel()
    
    // Assert queues
    await this.rabbitChannel.assertQueue('status_updates', { durable: true })
    await this.rabbitChannel.assertQueue('email_notifications', { durable: true })
    await this.rabbitChannel.assertQueue('follow_up_emails', { durable: true })
    
    logger.info('RabbitMQ connected successfully')
  }

  async setupBrowser() {
    this.browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    })
    logger.info('Browser initialized for status checking')
  }

  setupCronJobs() {
    // Daily status check at 1 AM
    cron.schedule(process.env.CRON_DAILY_STATUS || '0 1 * * *', async () => {
      logger.info('Starting daily status check')
      await this.performDailyStatusCheck()
    }, {
      timezone: 'America/New_York'
    })

    // Follow-up emails check every 6 hours
    cron.schedule('0 */6 * * *', async () => {
      logger.info('Checking for follow-up emails to send')
      await this.checkFollowUpEmails()
    })

    // Cleanup old data weekly
    cron.schedule('0 2 * * 0', async () => {
      logger.info('Starting weekly cleanup')
      await this.performWeeklyCleanup()
    })

    logger.info('Cron jobs scheduled successfully')
  }

  async performDailyStatusCheck() {
    if (this.isRunning) {
      logger.warn('Status check already running, skipping')
      return
    }

    this.isRunning = true
    
    try {
      // Get mutex lock
      const lockKey = 'status_check_lock'
      const lockAcquired = await this.redisClient.set(lockKey, '1', 'EX', 3600, 'NX')
      
      if (!lockAcquired) {
        logger.info('Status check already running on another instance')
        return
      }

      // Get applications that need status checking
      const applications = await this.Application.findAll({
        where: {
          status: ['applied', 'reviewing'],
          statusCheckedAt: {
            [this.sequelize.Op.or]: [
              null,
              {
                [this.sequelize.Op.lt]: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
              }
            ]
          }
        },
        limit: 100 // Process in batches
      })

      logger.info(`Found ${applications.length} applications to check`)

      for (const application of applications) {
        try {
          await this.checkApplicationStatus(application)
          await this.sleep(5000) // 5 second delay between checks
        } catch (error) {
          logger.error(`Error checking status for application ${application.id}:`, error)
        }
      }

      // Release lock
      await this.redisClient.del(lockKey)
      
    } catch (error) {
      logger.error('Error in daily status check:', error)
    } finally {
      this.isRunning = false
    }
  }

  async checkApplicationStatus(application) {
    try {
      const page = await this.browser.newPage()
      
      // Navigate to application page based on platform
      let newStatus = await this.checkStatusByPlatform(page, application)
      
      if (newStatus && newStatus !== application.status) {
        // Update status in database
        await application.update({
          status: newStatus,
          statusCheckedAt: new Date()
        })

        // Send status update notification
        await this.sendStatusUpdateNotification(application, newStatus)
        
        logger.info(`Status updated for ${application.jobTitle} at ${application.company}: ${application.status} -> ${newStatus}`)
      } else {
        // Just update the check timestamp
        await application.update({
          statusCheckedAt: new Date()
        })
      }
      
      await page.close()
      
    } catch (error) {
      logger.error(`Error checking status for application ${application.id}:`, error)
    }
  }

  async checkStatusByPlatform(page, application) {
    switch (application.platform) {
      case 'linkedin':
        return await this.checkLinkedInStatus(page, application)
      case 'indeed':
        return await this.checkIndeedStatus(page, application)
      case 'naukri':
        return await this.checkNaukriStatus(page, application)
      case 'monster':
        return await this.checkMonsterStatus(page, application)
      case 'glassdoor':
        return await this.checkGlassdoorStatus(page, application)
      default:
        return null
    }
  }

  async checkLinkedInStatus(page, application) {
    try {
      await page.goto(application.link, { waitUntil: 'networkidle' })
      
      const jobExists = await page.$('.jobs-search__job-detail--wrapper')
      if (!jobExists) {
        return 'closed'
      }

      const appliedIndicator = await page.$('.jobs-apply-button--applied')
      if (appliedIndicator) {
        return 'applied'
      }

      return application.status
      
    } catch (error) {
      logger.error('Error checking LinkedIn status:', error)
      return null
    }
  }

  async checkIndeedStatus(page, application) {
    try {
      await page.goto(application.link, { waitUntil: 'networkidle' })
      
      const jobContent = await page.$('[data-jk]')
      if (!jobContent) {
        return 'closed'
      }

      const appliedText = await page.$text='Applied'
      if (appliedText) {
        return 'applied'
      }

      return application.status
      
    } catch (error) {
      logger.error('Error checking Indeed status:', error)
      return null
    }
  }

  async checkNaukriStatus(page, application) {
    try {
      await page.goto(application.link, { waitUntil: 'networkidle' })
      
      const jobDetails = await page.$('.jd-header')
      if (!jobDetails) {
        return 'closed'
      }

      return application.status
      
    } catch (error) {
      logger.error('Error checking Naukri status:', error)
      return null
    }
  }

  async checkMonsterStatus(page, application) {
    try {
      await page.goto(application.link, { waitUntil: 'networkidle' })
      
      const jobExists = await page.$('.job-tittle')
      if (!jobExists) {
        return 'closed'
      }

      return application.status
      
    } catch (error) {
      logger.error('Error checking Monster status:', error)
      return null
    }
  }

  async checkGlassdoorStatus(page, application) {
    try {
      await page.goto(application.link, { waitUntil: 'networkidle' })
      
      const jobContent = await page.$('.jobDescriptionContent')
      if (!jobContent) {
        return 'closed'
      }

      return application.status
      
    } catch (error) {
      logger.error('Error checking Glassdoor status:', error)
      return null
    }
  }

  async sendStatusUpdateNotification(application, newStatus) {
    const notification = {
      type: 'status-update',
      data: {
        applicantEmail: 'user@example.com', // This should come from user data
        jobTitle: application.jobTitle,
        companyName: application.company,
        oldStatus: application.status,
        newStatus: newStatus,
        platform: application.platform,
        updatedDate: new Date().toISOString()
      }
    }

    await this.rabbitChannel.publish(
      'jbx_exchange',
      'email_notifications',
      Buffer.from(JSON.stringify(notification))
    )
  }

  async checkFollowUpEmails() {
    try {
      // Find applications that need follow-up emails
      const applicationsForFollowUp = await this.Application.findAll({
        where: {
          status: 'applied',
          followUpSent: false,
          appliedAt: {
            [this.sequelize.Op.lte]: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
          }
        },
        limit: 20 // Limit to avoid spam
      })

      logger.info(`Found ${applicationsForFollowUp.length} applications for follow-up`)

      for (const application of applicationsForFollowUp) {
        try {
          await this.scheduleFollowUpEmail(application)
          
          // Mark as follow-up sent
          await application.update({
            followUpSent: true,
            followUpSentAt: new Date()
          })
          
        } catch (error) {
          logger.error(`Error scheduling follow-up for application ${application.id}:`, error)
        }
      }
      
    } catch (error) {
      logger.error('Error in follow-up email check:', error)
    }
  }

  async scheduleFollowUpEmail(application) {
    const followUpData = {
      applicantName: 'John Doe', // This should come from user data
      applicantEmail: 'user@example.com', // This should come from user data
      jobTitle: application.jobTitle,
      companyName: application.company,
      appliedDate: application.appliedAt.toLocaleDateString(),
      platform: application.platform
    }

    await this.rabbitChannel.publish(
      'jbx_exchange',
      'follow_up_emails',
      Buffer.from(JSON.stringify(followUpData))
    )

    logger.info(`Follow-up email scheduled for ${application.jobTitle} at ${application.company}`)
  }

  async performWeeklyCleanup() {
    try {
      // Clean up old email history
      await this.redisClient.ltrim('email_history', 0, 499) // Keep last 500 emails
      
      // Clean up old logs (keep last 30 days)
      const oldLogDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      
      logger.info('Weekly cleanup completed')
      
    } catch (error) {
      logger.error('Error in weekly cleanup:', error)
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async cleanup() {
    if (this.browser) await this.browser.close()
    if (this.rabbitChannel) await this.rabbitChannel.close()
    if (this.rabbitConnection) await this.rabbitConnection.close()
    if (this.redisClient) await this.redisClient.quit()
    if (this.sequelize) await this.sequelize.close()
    if (this.mongoose) await mongoose.disconnect()
    
    logger.info('Scheduler cleanup completed')
  }
}

// Initialize and start scheduler
const scheduler = new JobScheduler()

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down scheduler')
  await scheduler.cleanup()
  process.exit(0)
})

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down scheduler')
  await scheduler.cleanup()
  process.exit(0)
})

// Start scheduler
scheduler.initialize().catch(error => {
  logger.error('Failed to start scheduler:', error)
  process.exit(1)
})

module.exports = JobScheduler

const amqp = require('amqplib')
const Redis = require('ioredis')
const nodemailer = require('nodemailer')
const winston = require('winston')
const Bull = require('bull')
const fs = require('fs').promises
const path = require('path')
const handlebars = require('handlebars')
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
    new winston.transports.File({ filename: 'logs/email-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/email.log' })
  ]
})

class EmailService {
  constructor() {
    this.transporter = null
    this.rabbitConnection = null
    this.rabbitChannel = null
    this.redis = null
    this.emailQueue = null
    this.templates = new Map()
  }

  async initialize() {
    try {
      // Setup Redis
      this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')
      logger.info('Redis connected')

      // Setup email queue
      this.emailQueue = new Bull('email queue', process.env.REDIS_URL || 'redis://localhost:6379')
      
      // Setup email transporter
      await this.setupEmailTransporter()

      // Setup RabbitMQ
      await this.setupRabbitMQ()

      // Load email templates
      await this.loadTemplates()

      // Process email queue
      this.emailQueue.process('send-email', this.processEmail.bind(this))
      this.emailQueue.process('send-follow-up', this.processFollowUp.bind(this))

      logger.info('Email service initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize email service:', error)
      process.exit(1)
    }
  }

  async setupEmailTransporter() {
    const config = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    }

    this.transporter = nodemailer.createTransport(config)
    
    // Verify transporter
    await this.transporter.verify()
    logger.info('Email transporter configured and verified')
  }

  async setupRabbitMQ() {
    this.rabbitConnection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost')
    this.rabbitChannel = await this.rabbitConnection.createChannel()

    // Assert queues
    await this.rabbitChannel.assertQueue('email_notifications', { durable: true })
    await this.rabbitChannel.assertQueue('follow_up_emails', { durable: true })

    // Consume messages
    await this.rabbitChannel.consume('email_notifications', this.handleEmailNotification.bind(this))
    await this.rabbitChannel.consume('follow_up_emails', this.handleFollowUpEmail.bind(this))

    logger.info('RabbitMQ connected and consuming messages')
  }

  async loadTemplates() {
    const templatesDir = path.join(__dirname, 'templates')
    
    try {
      // Application confirmation template
      const applicationTemplate = await fs.readFile(
        path.join(templatesDir, 'application-confirmation.hbs'), 
        'utf8'
      )
      this.templates.set('application-confirmation', handlebars.compile(applicationTemplate))

      // Follow-up template
      const followUpTemplate = await fs.readFile(
        path.join(templatesDir, 'follow-up.hbs'), 
        'utf8'
      )
      this.templates.set('follow-up', handlebars.compile(followUpTemplate))

      // Status update template
      const statusUpdateTemplate = await fs.readFile(
        path.join(templatesDir, 'status-update.hbs'), 
        'utf8'
      )
      this.templates.set('status-update', handlebars.compile(statusUpdateTemplate))

      logger.info('Email templates loaded successfully')
    } catch (error) {
      logger.warn('Could not load email templates:', error.message)
      // Create default templates
      this.createDefaultTemplates()
    }
  }

  async handleEmailNotification(msg) {
    if (msg) {
      try {
        const notification = JSON.parse(msg.content.toString())
        
        await this.emailQueue.add('send-email', notification, {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000
          }
        })

        this.rabbitChannel.ack(msg)
        logger.info('Email notification queued:', notification.type)
      } catch (error) {
        logger.error('Error handling email notification:', error)
        this.rabbitChannel.nack(msg, false, false)
      }
    }
  }

  async handleFollowUpEmail(msg) {
    if (msg) {
      try {
        const followUp = JSON.parse(msg.content.toString())
        
        await this.emailQueue.add('send-follow-up', followUp, {
          delay: followUp.delay || 0,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 10000
          }
        })

        this.rabbitChannel.ack(msg)
        logger.info('Follow-up email queued for:', followUp.companyName)
      } catch (error) {
        logger.error('Error handling follow-up email:', error)
        this.rabbitChannel.nack(msg, false, false)
      }
    }
  }

  async processEmail(job) {
    const { type, data } = job.data
    
    try {
      let emailContent = ''
      let subject = ''

      switch (type) {
        case 'application-confirmation':
          subject = `Application Submitted: ${data.jobTitle} at ${data.companyName}`
          emailContent = this.templates.get('application-confirmation')(data)
          break
          
        case 'status-update':
          subject = `Application Status Update: ${data.jobTitle} at ${data.companyName}`
          emailContent = this.templates.get('status-update')(data)
          break
          
        default:
          throw new Error(`Unknown email type: ${type}`)
      }

      const mailOptions = {
        from: process.env.SMTP_USER,
        to: data.applicantEmail,
        subject: subject,
        html: emailContent
      }

      await this.transporter.sendMail(mailOptions)
      logger.info(`Email sent successfully: ${type} to ${data.applicantEmail}`)
      
      // Store email history
      await this.storeEmailHistory(type, data, 'sent')
      
    } catch (error) {
      logger.error('Error processing email:', error)
      await this.storeEmailHistory(job.data.type, job.data.data, 'failed', error.message)
      throw error
    }
  }

  async processFollowUp(job) {
    const data = job.data
    
    try {
      const subject = `Following up: ${data.jobTitle} Application`
      const emailContent = this.templates.get('follow-up')(data)

      const mailOptions = {
        from: process.env.SMTP_USER,
        to: data.hrEmail || data.companyEmail,
        subject: subject,
        html: emailContent,
        replyTo: data.applicantEmail
      }

      await this.transporter.sendMail(mailOptions)
      logger.info(`Follow-up email sent for ${data.jobTitle} at ${data.companyName}`)
      
      // Store follow-up history
      await this.storeEmailHistory('follow-up', data, 'sent')
      
    } catch (error) {
      logger.error('Error processing follow-up email:', error)
      await this.storeEmailHistory('follow-up', data, 'failed', error.message)
      throw error
    }
  }

  async storeEmailHistory(type, data, status, error = null) {
    const history = {
      type,
      to: data.applicantEmail || data.hrEmail,
      companyName: data.companyName,
      jobTitle: data.jobTitle,
      status,
      error,
      timestamp: new Date().toISOString()
    }

    await this.redis.lpush('email_history', JSON.stringify(history))
    await this.redis.ltrim('email_history', 0, 999) // Keep last 1000 emails
  }

  async cleanup() {
    if (this.emailQueue) await this.emailQueue.close()
    if (this.rabbitChannel) await this.rabbitChannel.close()
    if (this.rabbitConnection) await this.rabbitConnection.close()
    if (this.redis) await this.redis.quit()
    
    logger.info('Email service cleanup completed')
  }
}

// Initialize and start email service
const emailService = new EmailService()

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down email service')
  await emailService.cleanup()
  process.exit(0)
})

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down email service')
  await emailService.cleanup()
  process.exit(0)
})

// Start email service
emailService.initialize().catch(error => {
  logger.error('Failed to start email service:', error)
  process.exit(1)
})

module.exports = EmailService

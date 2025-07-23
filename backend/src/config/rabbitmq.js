const amqp = require('amqplib')
const logger = require('./logging').setupLogging()

let connection = null
let channel = null

const EXCHANGE_NAME = 'jbx_exchange'
const QUEUES = {
  JOB_APPLICATIONS: 'job_applications',
  EMAIL_NOTIFICATIONS: 'email_notifications',
  STATUS_UPDATES: 'status_updates',
  COVER_LETTER_GENERATION: 'cover_letter_generation'
}

const setupRabbitMQ = async () => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost')
    
    connection.on('error', (err) => {
      logger.error('RabbitMQ connection error:', err)
    })

    connection.on('close', () => {
      logger.warn('RabbitMQ connection closed')
    })

    channel = await connection.createChannel()
    
    // Create exchange
    await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true })
    
    // Create queues
    for (const queueName of Object.values(QUEUES)) {
      await channel.assertQueue(queueName, { durable: true })
      await channel.bindQueue(queueName, EXCHANGE_NAME, queueName)
    }

    logger.info('RabbitMQ setup completed')
    return { connection, channel }
  } catch (error) {
    logger.error('Failed to setup RabbitMQ:', error)
    throw error
  }
}

const publishMessage = async (queue, message, options = {}) => {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized')
  }

  try {
    const messageBuffer = Buffer.from(JSON.stringify(message))
    await channel.publish(
      EXCHANGE_NAME,
      queue,
      messageBuffer,
      { persistent: true, ...options }
    )
    logger.debug(`Message published to queue ${queue}`)
  } catch (error) {
    logger.error(`Failed to publish message to queue ${queue}:`, error)
    throw error
  }
}

const consumeMessages = async (queue, handler, options = {}) => {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized')
  }

  try {
    await channel.consume(queue, async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString())
          await handler(content, msg)
          channel.ack(msg)
        } catch (error) {
          logger.error(`Error processing message from queue ${queue}:`, error)
          channel.nack(msg, false, false) // Don't requeue
        }
      }
    }, { noAck: false, ...options })

    logger.info(`Started consuming messages from queue ${queue}`)
  } catch (error) {
    logger.error(`Failed to consume messages from queue ${queue}:`, error)
    throw error
  }
}

module.exports = {
  setupRabbitMQ,
  publishMessage,
  consumeMessages,
  QUEUES,
  EXCHANGE_NAME
}

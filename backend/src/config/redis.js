const redis = require('redis')
const logger = require('./logging').setupLogging()

let redisClient = null

const setupRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          logger.error('Redis server connection refused')
          return new Error('Redis server connection refused')
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          logger.error('Redis retry time exhausted')
          return new Error('Retry time exhausted')
        }
        if (options.attempt > 10) {
          logger.error('Redis max retry attempts reached')
          return undefined
        }
        return Math.min(options.attempt * 100, 3000)
      }
    })

    redisClient.on('error', (err) => {
      logger.error('Redis error:', err)
    })

    redisClient.on('connect', () => {
      logger.info('Redis connected')
    })

    redisClient.on('ready', () => {
      logger.info('Redis ready')
    })

    await redisClient.connect()
    return redisClient
  } catch (error) {
    logger.error('Failed to setup Redis:', error)
    throw error
  }
}

const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client not initialized')
  }
  return redisClient
}

module.exports = { setupRedis, getRedisClient }

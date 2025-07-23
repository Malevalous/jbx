const mongoose = require('mongoose')
const { Sequelize } = require('sequelize')
const logger = require('./logging').setupLogging()

// MongoDB connection
const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    logger.info('MongoDB connected successfully')
  } catch (error) {
    logger.error('MongoDB connection error:', error)
    throw error
  }
}

// PostgreSQL connection
const connectPostgreSQL = async () => {
  try {
    const sequelize = new Sequelize(process.env.POSTGRES_URL, {
      dialect: 'postgres',
      logging: (msg) => logger.debug(msg),
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    })

    await sequelize.authenticate()
    logger.info('PostgreSQL connected successfully')
    
    // Sync models (only in development)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true })
      logger.info('Database models synchronized')
    }

    return sequelize
  } catch (error) {
    logger.error('PostgreSQL connection error:', error)
    throw error
  }
}

const connectDatabases = async () => {
  await connectMongoDB()
  const sequelize = await connectPostgreSQL()
  return { sequelize }
}

module.exports = { connectDatabases, connectMongoDB, connectPostgreSQL }

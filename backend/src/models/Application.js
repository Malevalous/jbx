const { DataTypes } = require('sequelize')
const { connectPostgreSQL } = require('../config/database')

const defineApplicationModel = async () => {
  const sequelize = await connectPostgreSQL()
  
  const Application = sequelize.define('Application', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
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
    location: {
      type: DataTypes.STRING
    },
    jobDescription: {
      type: DataTypes.TEXT
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
    salary: {
      type: DataTypes.STRING
    },
    employmentType: {
      type: DataTypes.STRING
    },
    experienceLevel: {
      type: DataTypes.STRING
    },
    coverLetterPath: {
      type: DataTypes.STRING
    },
    resumePath: {
      type: DataTypes.STRING
    },
    followUpSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    followUpSentAt: {
      type: DataTypes.DATE
    },
    retries: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    lastError: {
      type: DataTypes.TEXT
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'applications',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'platform', 'platformJobId']
      },
      {
        fields: ['userId', 'status']
      },
      {
        fields: ['platform', 'appliedAt']
      },
      {
        fields: ['statusCheckedAt']
      }
    ]
  })

  return Application
}

module.exports = { defineApplicationModel }

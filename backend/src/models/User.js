const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    location: String,
    resumePath: String,
    portfolioUrl: String,
    linkedinUrl: String,
    githubUrl: String,
    skills: [String],
    experience: {
      level: {
        type: String,
        enum: ['entry', 'mid', 'senior', 'lead', 'executive']
      },
      years: Number
    }
  },
  preferences: {
    jobTypes: [{
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship']
    }],
    workModes: [{
      type: String,
      enum: ['remote', 'hybrid', 'onsite']
    }],
    salaryRange: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'USD'
      }
    },
    locations: [String],
    industries: [String]
  },
  settings: {
    maxApplicationsPerDay: {
      type: Number,
      default: 10
    },
    maxApplicationsPerPlatform: {
      type: Number,
      default: 5
    },
    delayBetweenApplications: {
      type: Number,
      default: 60 // seconds
    },
    enableEmailNotifications: {
      type: Boolean,
      default: true
    },
    enableFollowUpEmails: {
      type: Boolean,
      default: true
    },
    followUpDelay: {
      type: Number,
      default: 3 // days
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLoginAt: Date,
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password
      delete ret.emailVerificationToken
      return ret
    }
  }
})

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model('User', userSchema)

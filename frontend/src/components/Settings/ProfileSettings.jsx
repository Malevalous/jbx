import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-hot-toast'

export default function ProfileSettings({ user }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.profile?.phone || '',
    location: user?.profile?.location || '',
    linkedinUrl: user?.profile?.linkedinUrl || '',
    githubUrl: user?.profile?.githubUrl || '',
    portfolioUrl: user?.profile?.portfolioUrl || '',
    skills: user?.profile?.skills?.join(', ') || '',
    experienceLevel: user?.profile?.experience?.level || 'mid',
    experienceYears: user?.profile?.experience?.years || ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // API call to update profile
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResumeUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB')
        return
      }
      if (!file.type.includes('pdf') && !file.type.includes('doc')) {
        toast.error('Please upload a PDF or DOC file')
        return
      }
      // Handle file upload
      toast.success('Resume uploaded successfully!')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Profile Information
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Update your personal information and resume
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="form-label">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div>
            <label className="form-label">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div>
            <label className="form-label">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="form-input"
              placeholder="City, Country"
            />
          </div>
        </div>

        {/* Professional Links */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Professional Links</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="form-label">
                LinkedIn URL
              </label>
              <input
                type="url"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleChange}
                className="form-input"
                placeholder="https://linkedin.com/in/yourname"
              />
            </div>

            <div>
              <label className="form-label">
                GitHub URL
              </label>
              <input
                type="url"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleChange}
                className="form-input"
                placeholder="https://github.com/yourname"
              />
            </div>

            <div>
              <label className="form-label">
                Portfolio URL
              </label>
              <input
                type="url"
                name="portfolioUrl"
                value={formData.portfolioUrl}
                onChange={handleChange}
                className="form-input"
                placeholder="https://yourportfolio.com"
              />
            </div>
          </div>
        </div>

        {/* Skills and Experience */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Skills & Experience</h4>
          <div>
            <label className="form-label">
              Skills
            </label>
            <textarea
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              rows={3}
              className="form-input"
              placeholder="JavaScript, React, Node.js, Python, etc."
            />
            <p className="mt-1 text-sm text-gray-500">
              Separate skills with commas
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="form-label">
                Experience Level
              </label>
              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                className="form-input"
              >
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="lead">Lead/Principal</option>
                <option value="executive">Executive</option>
              </select>
            </div>

            <div>
              <label className="form-label">
                Years of Experience
              </label>
              <input
                type="number"
                name="experienceYears"
                value={formData.experienceYears}
                onChange={handleChange}
                className="form-input"
                min="0"
                max="50"
              />
            </div>
          </div>
        </div>

        {/* Resume Upload */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Resume</h4>
          <div>
            <label className="form-label">
              Upload Resume
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
            <p className="mt-1 text-sm text-gray-500">
              PDF or DOC files up to 10MB
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? (
              <div className="loading-spinner mr-2"></div>
            ) : null}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}

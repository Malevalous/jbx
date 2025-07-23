import React, { useState } from 'react'
import { toast } from 'react-hot-toast'

export default function AutomationSettings({ user }) {
  const [settings, setSettings] = useState({
    maxApplicationsPerDay: user?.settings?.maxApplicationsPerDay || 10,
    maxApplicationsPerPlatform: user?.settings?.maxApplicationsPerPlatform || 5,
    delayBetweenApplications: user?.settings?.delayBetweenApplications || 60,
    enableEmailNotifications: user?.settings?.enableEmailNotifications ?? true,
    enableFollowUpEmails: user?.settings?.enableFollowUpEmails ?? true,
    followUpDelay: user?.settings?.followUpDelay || 3,
    jobTypes: user?.preferences?.jobTypes || [],
    workModes: user?.preferences?.workModes || [],
    salaryMin: user?.preferences?.salaryRange?.min || '',
    salaryMax: user?.preferences?.salaryRange?.max || '',
    locations: user?.preferences?.locations?.join(', ') || '',
    industries: user?.preferences?.industries?.join(', ') || ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleJobTypeChange = (jobType) => {
    const updatedJobTypes = settings.jobTypes.includes(jobType)
      ? settings.jobTypes.filter(type => type !== jobType)
      : [...settings.jobTypes, jobType]
    
    setSettings({
      ...settings,
      jobTypes: updatedJobTypes
    })
  }

  const handleWorkModeChange = (workMode) => {
    const updatedWorkModes = settings.workModes.includes(workMode)
      ? settings.workModes.filter(mode => mode !== workMode)
      : [...settings.workModes, workMode]
    
    setSettings({
      ...settings,
      workModes: updatedWorkModes
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // API call to update automation settings
      toast.success('Automation settings updated successfully!')
    } catch (error) {
      toast.error('Failed to update settings')
    } finally {
      setIsLoading(false)
    }
  }

  const jobTypeOptions = ['full-time', 'part-time', 'contract', 'freelance', 'internship']
  const workModeOptions = ['remote', 'hybrid', 'onsite']

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Automation Settings
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Configure how your job application automation behaves
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rate Limiting */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Rate Limiting</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="form-label">
                Max Applications Per Day
              </label>
              <input
                type="number"
                name="maxApplicationsPerDay"
                value={settings.maxApplicationsPerDay}
                onChange={handleChange}
                className="form-input"
                min="1"
                max="100"
              />
            </div>

            <div>
              <label className="form-label">
                Max Per Platform
              </label>
              <input
                type="number"
                name="maxApplicationsPerPlatform"
                value={settings.maxApplicationsPerPlatform}
                onChange={handleChange}
                className="form-input"
                min="1"
                max="20"
              />
            </div>

            <div>
              <label className="form-label">
                Delay Between Applications (seconds)
              </label>
              <input
                type="number"
                name="delayBetweenApplications"
                value={settings.delayBetweenApplications}
                onChange={handleChange}
                className="form-input"
                min="30"
                max="300"
              />
            </div>
          </div>
        </div>

        {/* Job Preferences */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Job Preferences</h4>
          
          <div>
            <label className="form-label">Job Types</label>
            <div className="mt-2 space-y-2">
              {jobTypeOptions.map((jobType) => (
                <label key={jobType} className="inline-flex items-center mr-6">
                  <input
                    type="checkbox"
                    checked={settings.jobTypes.includes(jobType)}
                    onChange={() => handleJobTypeChange(jobType)}
                    className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">
                    {jobType.replace('-', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label">Work Modes</label>
            <div className="mt-2 space-y-2">
              {workModeOptions.map((workMode) => (
                <label key={workMode} className="inline-flex items-center mr-6">
                  <input
                    type="checkbox"
                    checked={settings.workModes.includes(workMode)}
                    onChange={() => handleWorkModeChange(workMode)}
                    className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">
                    {workMode}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="form-label">
                Minimum Salary (USD)
              </label>
              <input
                type="number"
                name="salaryMin"
                value={settings.salaryMin}
                onChange={handleChange}
                className="form-input"
                placeholder="50000"
              />
            </div>

            <div>
              <label className="form-label">
                Maximum Salary (USD)
              </label>
              <input
                type="number"
                name="salaryMax"
                value={settings.salaryMax}
                onChange={handleChange}
                className="form-input"
                placeholder="150000"
              />
            </div>
          </div>

          <div>
            <label className="form-label">
              Preferred Locations
            </label>
            <input
              type="text"
              name="locations"
              value={settings.locations}
              onChange={handleChange}
              className="form-input"
              placeholder="New York, San Francisco, Remote"
            />
            <p className="mt-1 text-sm text-gray-500">
              Separate locations with commas
            </p>
          </div>

          <div>
            <label className="form-label">
              Preferred Industries
            </label>
            <input
              type="text"
              name="industries"
              value={settings.industries}
              onChange={handleChange}
              className="form-input"
              placeholder="Technology, Finance, Healthcare"
            />
            <p className="mt-1 text-sm text-gray-500">
              Separate industries with commas
            </p>
          </div>
        </div>

        {/* Email Settings */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Email Settings</h4>
          <div className="space-y-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="enableEmailNotifications"
                checked={settings.enableEmailNotifications}
                onChange={handleChange}
                className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">
                Enable email notifications for application updates
              </span>
            </label>

            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="enableFollowUpEmails"
                checked={settings.enableFollowUpEmails}
                onChange={handleChange}
                className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">
                Send follow-up emails to hiring managers
              </span>
            </label>

            {settings.enableFollowUpEmails && (
              <div className="ml-6">
                <label className="form-label">
                  Follow-up Delay (days)
                </label>
                <input
                  type="number"
                  name="followUpDelay"
                  value={settings.followUpDelay}
                  onChange={handleChange}
                  className="form-input w-24"
                  min="1"
                  max="14"
                />
              </div>
            )}
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
            Save Settings
          </button>
        </div>
      </form>
    </div>
  )
}

import React, { useState } from 'react'
import { toast } from 'react-hot-toast'

export default function NotificationSettings({ user }) {
  const [settings, setSettings] = useState({
    emailNotifications: {
      applicationSubmitted: true,
      statusUpdates: true,
      weeklyReport: true,
      systemAlerts: true
    },
    browserNotifications: {
      enabled: false,
      applicationSubmitted: false,
      statusUpdates: true,
      systemAlerts: true
    },
    frequency: 'immediate', // immediate, daily, weekly
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleEmailNotificationChange = (key) => {
    setSettings({
      ...settings,
      emailNotifications: {
        ...settings.emailNotifications,
        [key]: !settings.emailNotifications[key]
      }
    })
  }

  const handleBrowserNotificationChange = (key) => {
    setSettings({
      ...settings,
      browserNotifications: {
        ...settings.browserNotifications,
        [key]: !settings.browserNotifications[key]
      }
    })
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setSettings({
        ...settings,
        [parent]: {
          ...settings[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      })
    } else {
      setSettings({
        ...settings,
        [name]: type === 'checkbox' ? checked : value
      })
    }
  }

  const requestBrowserPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setSettings({
          ...settings,
          browserNotifications: {
            ...settings.browserNotifications,
            enabled: true
          }
        })
        toast.success('Browser notifications enabled!')
      } else {
        toast.error('Browser notification permission denied')
      }
    } else {
      toast.error('Browser notifications not supported')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // API call to update notification settings
      toast.success('Notification settings updated successfully!')
    } catch (error) {
      toast.error('Failed to update notification settings')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Notification Settings
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Choose how and when you want to be notified
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Notifications */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Email Notifications</h4>
          <div className="space-y-3">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={settings.emailNotifications.applicationSubmitted}
                onChange={() => handleEmailNotificationChange('applicationSubmitted')}
                className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
              />
              <span className="ml-3">
                <span className="text-sm font-medium text-gray-700">Application Submitted</span>
                <span className="block text-sm text-gray-500">
                  Get notified when an application is successfully submitted
                </span>
              </span>
            </label>

            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={settings.emailNotifications.statusUpdates}
                onChange={() => handleEmailNotificationChange('statusUpdates')}
                className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
              />
              <span className="ml-3">
                <span className="text-sm font-medium text-gray-700">Status Updates</span>
                <span className="block text-sm text-gray-500">
                  Get notified when application status changes
                </span>
              </span>
            </label>

            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={settings.emailNotifications.weeklyReport}
                onChange={() => handleEmailNotificationChange('weeklyReport')}
                className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
              />
              <span className="ml-3">
                <span className="text-sm font-medium text-gray-700">Weekly Report</span>
                <span className="block text-sm text-gray-500">
                  Receive a weekly summary of your application activity
                </span>
              </span>
            </label>

            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={settings.emailNotifications.systemAlerts}
                onChange={() => handleEmailNotificationChange('systemAlerts')}
                className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
              />
              <span className="ml-3">
                <span className="text-sm font-medium text-gray-700">System Alerts</span>
                <span className="block text-sm text-gray-500">
                  Get notified about system issues or maintenance
                </span>
              </span>
            </label>
          </div>
        </div>

        {/* Browser Notifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium text-gray-900">Browser Notifications</h4>
            {!settings.browserNotifications.enabled && (
              <button
                type="button"
                onClick={requestBrowserPermission}
                className="btn-secondary text-xs"
              >
                Enable
              </button>
            )}
          </div>
          
          {settings.browserNotifications.enabled ? (
            <div className="space-y-3">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={settings.browserNotifications.applicationSubmitted}
                  onChange={() => handleBrowserNotificationChange('applicationSubmitted')}
                  className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                />
                <span className="ml-3 text-sm text-gray-700">Application Submitted</span>
              </label>

              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={settings.browserNotifications.statusUpdates}
                  onChange={() => handleBrowserNotificationChange('statusUpdates')}
                  className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                />
                <span className="ml-3 text-sm text-gray-700">Status Updates</span>
              </label>

              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={settings.browserNotifications.systemAlerts}
                  onChange={() => handleBrowserNotificationChange('systemAlerts')}
                  className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                />
                <span className="ml-3 text-sm text-gray-700">System Alerts</span>
              </label>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Enable browser notifications to receive real-time updates
            </p>
          )}
        </div>

        {/* Notification Frequency */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Notification Frequency</h4>
          <div className="space-y-2">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="frequency"
                value="immediate"
                checked={settings.frequency === 'immediate'}
                onChange={handleChange}
                className="border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
              />
              <span className="ml-3 text-sm text-gray-700">Immediate</span>
            </label>

            <label className="inline-flex items-center">
              <input
                type="radio"
                name="frequency"
                value="daily"
                checked={settings.frequency === 'daily'}
                onChange={handleChange}
                className="border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
              />
              <span className="ml-3 text-sm text-gray-700">Daily Digest</span>
            </label>

            <label className="inline-flex items-center">
              <input
                type="radio"
                name="frequency"
                value="weekly"
                checked={settings.frequency === 'weekly'}
                onChange={handleChange}
                className="border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
              />
              <span className="ml-3 text-sm text-gray-700">Weekly Summary</span>
            </label>
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Quiet Hours</h4>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="quietHours.enabled"
              checked={settings.quietHours.enabled}
              onChange={handleChange}
              className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
            />
            <span className="ml-3 text-sm text-gray-700">
              Enable quiet hours (no notifications during specified times)
            </span>
          </label>

          {settings.quietHours.enabled && (
            <div className="ml-6 grid grid-cols-2 gap-4 max-w-xs">
              <div>
                <label className="form-label text-xs">Start Time</label>
                <input
                  type="time"
                  name="quietHours.start"
                  value={settings.quietHours.start}
                  onChange={handleChange}
                  className="form-input text-sm"
                />
              </div>
              <div>
                <label className="form-label text-xs">End Time</label>
                <input
                  type="time"
                  name="quietHours.end"
                  value={settings.quietHours.end}
                  onChange={handleChange}
                  className="form-input text-sm"
                />
              </div>
            </div>
          )}
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

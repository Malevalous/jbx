import React, { useState, useEffect } from 'react'
import { 
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'

export default function PlatformConfigModal({ isOpen, onClose, platform, onSave, isLoading }) {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    phone: '',
    firstName: '',
    lastName: '',
    resumePath: ''
  })
  const [searchSettings, setSearchSettings] = useState({
    keywords: '',
    locations: '',
    excludeKeywords: '',
    maxApplicationsPerDay: 5
  })
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (platform && isOpen) {
      setCredentials({
        email: platform.credentials?.email || '',
        password: '', // Never pre-fill password for security
        phone: platform.credentials?.phone || '',
        firstName: platform.credentials?.firstName || '',
        lastName: platform.credentials?.lastName || '',
        resumePath: platform.credentials?.resumePath || ''
      })
      setSearchSettings({
        keywords: platform.searchSettings?.keywords || '',
        locations: platform.searchSettings?.locations || '',
        excludeKeywords: platform.searchSettings?.excludeKeywords || '',
        maxApplicationsPerDay: platform.searchSettings?.maxApplicationsPerDay || 5
      })
    }
  }, [platform, isOpen])

  const handleCredentialChange = (field, value) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSearchSettingChange = (field, value) => {
    setSearchSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = () => {
    onSave({
      credentials,
      searchSettings,
      isActive: true
    })
  }

  if (!isOpen || !platform) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Configure {platform.name}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Login Credentials */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Login Credentials</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={credentials.email}
                      onChange={(e) => handleCredentialChange('email', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={credentials.password}
                        onChange={(e) => handleCredentialChange('password', e.target.value)}
                        className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={credentials.firstName}
                      onChange={(e) => handleCredentialChange('firstName', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={credentials.lastName}
                      onChange={(e) => handleCredentialChange('lastName', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={credentials.phone}
                      onChange={(e) => handleCredentialChange('phone', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Search Settings */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Search Settings</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Keywords
                    </label>
                    <input
                      type="text"
                      value={searchSettings.keywords}
                      onChange={(e) => handleSearchSettingChange('keywords', e.target.value)}
                      placeholder="software engineer, react, node.js"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                    <p className="mt-1 text-sm text-gray-500">Separate keywords with commas</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Locations
                    </label>
                    <input
                      type="text"
                      value={searchSettings.locations}
                      onChange={(e) => handleSearchSettingChange('locations', e.target.value)}
                      placeholder="New York, San Francisco, Remote"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                    <p className="mt-1 text-sm text-gray-500">Separate locations with commas</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Exclude Keywords
                    </label>
                    <input
                      type="text"
                      value={searchSettings.excludeKeywords}
                      onChange={(e) => handleSearchSettingChange('excludeKeywords', e.target.value)}
                      placeholder="senior, lead, manager"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                    <p className="mt-1 text-sm text-gray-500">Jobs containing these words will be skipped</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Applications Per Day
                    </label>
                    <input
                      type="number"
                      value={searchSettings.maxApplicationsPerDay}
                      onChange={(e) => handleSearchSettingChange('maxApplicationsPerDay', parseInt(e.target.value))}
                      min="1"
                      max="20"
                      className="block w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Security Notice
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Your credentials are encrypted and stored securely. We recommend using app-specific passwords when available.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading || !credentials.email || !credentials.password}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="loading-spinner mr-2" />
              ) : null}
              Save Configuration
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

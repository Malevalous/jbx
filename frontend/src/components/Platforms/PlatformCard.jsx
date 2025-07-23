import React, { useState } from 'react'
import { 
  CogIcon,
  PlayIcon,
  StopIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

const platformIcons = {
  linkedin: '🔗',
  indeed: '💼',
  naukri: '🇮🇳',
  monster: '👹',
  glassdoor: '🚪'
}

const statusConfig = {
  active: {
    icon: CheckCircleIcon,
    color: 'bg-green-100 text-green-800',
    label: 'Active'
  },
  inactive: {
    icon: XCircleIcon,
    color: 'bg-red-100 text-red-800',
    label: 'Inactive'
  },
  warning: {
    icon: ExclamationTriangleIcon,
    color: 'bg-yellow-100 text-yellow-800',
    label: 'Warning'
  }
}

export default function PlatformCard({ platform, onConfigure, onToggle }) {
  const [isLoading, setIsLoading] = useState(false)
  const config = statusConfig[platform.status] || statusConfig.inactive
  const StatusIcon = config.icon

  const handleToggle = async () => {
    setIsLoading(true)
    try {
      await onToggle(platform)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="text-3xl">
              {platformIcons[platform.id] || '🔗'}
            </div>
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-medium text-gray-900">
              {platform.name}
            </h3>
            <p className="text-sm text-gray-500">
              {platform.description}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
              <StatusIcon className="w-4 h-4 mr-1" />
              {config.label}
            </span>
          </div>
        </div>

        {/* Platform Stats */}
        {platform.stats && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Applications</dt>
              <dd className="text-lg font-semibold text-gray-900">
                {platform.stats.totalApplications || 0}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Success Rate</dt>
              <dd className="text-lg font-semibold text-gray-900">
                {platform.stats.successRate || 0}%
              </dd>
            </div>
          </div>
        )}

        {/* Last Activity */}
        {platform.lastActivity && (
          <div className="mt-4">
            <p className="text-xs text-gray-500">
              Last activity: {platform.lastActivity}
            </p>
          </div>
        )}
      </div>

      <div className="bg-gray-50 px-6 py-3">
        <div className="flex justify-between items-center">
          <button
            onClick={() => onConfigure(platform)}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <CogIcon className="h-4 w-4 mr-1" />
            Configure
          </button>

          <button
            onClick={handleToggle}
            disabled={isLoading}
            className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              platform.status === 'active'
                ? 'text-red-700 bg-red-100 hover:bg-red-200 focus:ring-red-500'
                : 'text-green-700 bg-green-100 hover:bg-green-200 focus:ring-green-500'
            } disabled:opacity-50`}
          >
            {isLoading ? (
              <div className="loading-spinner h-4 w-4 mr-1" />
            ) : platform.status === 'active' ? (
              <StopIcon className="h-4 w-4 mr-1" />
            ) : (
              <PlayIcon className="h-4 w-4 mr-1" />
            )}
            {platform.status === 'active' ? 'Disable' : 'Enable'}
          </button>
        </div>
      </div>
    </div>
  )
}

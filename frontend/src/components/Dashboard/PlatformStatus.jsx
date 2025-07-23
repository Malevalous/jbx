import React from 'react'
import { 
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
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
    color: 'text-green-600 bg-green-100',
    label: 'Active'
  },
  inactive: {
    icon: XCircleIcon,
    color: 'text-red-600 bg-red-100',
    label: 'Inactive'
  },
  warning: {
    icon: ExclamationTriangleIcon,
    color: 'text-yellow-600 bg-yellow-100',
    label: 'Warning'
  },
  pending: {
    icon: ClockIcon,
    color: 'text-blue-600 bg-blue-100',
    label: 'Pending'
  }
}

function PlatformStatus({ platforms }) {
  if (!platforms || platforms.length === 0) {
    return (
      <div className="text-center py-8">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No platforms configured</h3>
        <p className="mt-1 text-sm text-gray-500">
          Configure job platforms to start automation
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {platforms.map((platform) => {
        const config = statusConfig[platform.status] || statusConfig.inactive
        const StatusIcon = config.icon

        return (
          <div key={platform.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">
                {platformIcons[platform.platform] || '🔗'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {platform.platform}
                </p>
                <p className="text-xs text-gray-500">
                  {platform.applicationsCount || 0} applications
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {platform.lastActivity && (
                <p className="text-xs text-gray-400">
                  {platform.lastActivity}
                </p>
              )}
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {config.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Add default export
export default PlatformStatus

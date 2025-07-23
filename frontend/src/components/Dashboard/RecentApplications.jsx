import React from 'react'
import { format } from 'date-fns'
import { 
  BuildingOfficeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

const statusIcons = {
  applied: CheckCircleIcon,
  failed: XCircleIcon,
  pending: ClockIcon,
  reviewing: ClockIcon
}

const statusColors = {
  applied: 'text-green-600 bg-green-100',
  failed: 'text-red-600 bg-red-100',
  pending: 'text-yellow-600 bg-yellow-100',
  reviewing: 'text-blue-600 bg-blue-100'
}

function RecentApplications({ applications }) {
  if (!applications || applications.length === 0) {
    return (
      <div className="text-center py-8">
        <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No recent applications</h3>
        <p className="mt-1 text-sm text-gray-500">
          Your recent job applications will appear here
        </p>
      </div>
    )
  }

  return (
    <div className="flow-root">
      <ul role="list" className="-my-5 divide-y divide-gray-200">
        {applications.map((application) => {
          const StatusIcon = statusIcons[application.status] || ClockIcon
          const statusColor = statusColors[application.status] || 'text-gray-600 bg-gray-100'

          return (
            <li key={application.id} className="py-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <BuildingOfficeIcon className="h-5 w-5 text-gray-500" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {application.jobTitle}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {application.company}
                  </p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(application.appliedAt), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </span>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// Add default export
export default RecentApplications

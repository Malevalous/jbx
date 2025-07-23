import React from 'react'
import { format } from 'date-fns'
import { 
  BuildingOfficeIcon,
  CalendarIcon,
  LinkIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

const statusConfig = {
  applied: {
    icon: CheckCircleIcon,
    color: 'text-green-600 bg-green-100',
    label: 'Applied'
  },
  failed: {
    icon: XCircleIcon,
    color: 'text-red-600 bg-red-100',
    label: 'Failed'
  },
  pending: {
    icon: ClockIcon,
    color: 'text-yellow-600 bg-yellow-100',
    label: 'Pending'
  },
  reviewing: {
    icon: ExclamationTriangleIcon,
    color: 'text-blue-600 bg-blue-100',
    label: 'Under Review'
  },
  interview: {
    icon: CheckCircleIcon,
    color: 'text-purple-600 bg-purple-100',
    label: 'Interview'
  },
  offer: {
    icon: CheckCircleIcon,
    color: 'text-emerald-600 bg-emerald-100',
    label: 'Offer'
  },
  rejected: {
    icon: XCircleIcon,
    color: 'text-red-600 bg-red-100',
    label: 'Rejected'
  }
}

export default function ApplicationDetails({ application }) {
  if (!application) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center text-gray-500">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No application selected</h3>
          <p className="mt-1 text-sm text-gray-500">
            Select an application from the list to view details
          </p>
        </div>
      </div>
    )
  }

  const StatusIcon = statusConfig[application.status]?.icon || ClockIcon
  const statusColor = statusConfig[application.status]?.color || 'text-gray-600 bg-gray-100'
  const statusLabel = statusConfig[application.status]?.label || application.status

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Application Details</h3>
      </div>

      {/* Content */}
      <div className="px-6 py-4 space-y-6">
        {/* Job Information */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Job Information</h4>
          <div className="space-y-3">
            <div>
              <h5 className="text-base font-semibold text-gray-900">{application.jobTitle}</h5>
              <div className="flex items-center mt-1 text-sm text-gray-600">
                <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                {application.company}
              </div>
            </div>
            
            {application.location && (
              <div className="flex items-center text-sm text-gray-600">
                <span className="font-medium mr-2">Location:</span>
                {application.location}
              </div>
            )}

            {application.salary && (
              <div className="flex items-center text-sm text-gray-600">
                <span className="font-medium mr-2">Salary:</span>
                {application.salary}
              </div>
            )}

            {application.employmentType && (
              <div className="flex items-center text-sm text-gray-600">
                <span className="font-medium mr-2">Type:</span>
                <span className="capitalize">{application.employmentType}</span>
              </div>
            )}
          </div>
        </div>

        {/* Application Status */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Application Status</h4>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                <StatusIcon className="w-4 h-4 mr-1" />
                {statusLabel}
              </span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <CalendarIcon className="h-4 w-4 mr-1" />
              <span className="font-medium mr-2">Applied on:</span>
              {format(new Date(application.appliedAt), 'MMM dd, yyyy')}
            </div>

            {application.statusCheckedAt && (
              <div className="flex items-center text-sm text-gray-600">
                <ClockIcon className="h-4 w-4 mr-1" />
                <span className="font-medium mr-2">Last checked:</span>
                {format(new Date(application.statusCheckedAt), 'MMM dd, yyyy')}
              </div>
            )}
          </div>
        </div>

        {/* Platform Information */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Platform Details</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Platform:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                {application.platform}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Job ID:</span>
              <span className="text-sm font-mono text-gray-900">{application.platformJobId}</span>
            </div>
          </div>
        </div>

        {/* Job Description */}
        {application.jobDescription && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Job Description</h4>
            <div className="text-sm text-gray-600 max-h-32 overflow-y-auto bg-gray-50 p-3 rounded-md">
              {application.jobDescription.length > 500 
                ? `${application.jobDescription.substring(0, 500)}...`
                : application.jobDescription
              }
            </div>
          </div>
        )}

        {/* Actions */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Actions</h4>
          <div className="flex flex-wrap gap-2">
            <a
              href={application.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <LinkIcon className="h-3 w-3 mr-1" />
              View Original
            </a>
            
            {application.coverLetterPath && (
              <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <DocumentTextIcon className="h-3 w-3 mr-1" />
                View Cover Letter
              </button>
            )}
            
            {application.followUpSent && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <EnvelopeIcon className="h-3 w-3 mr-1" />
                Follow-up Sent
              </span>
            )}
          </div>
        </div>

        {/* Metadata */}
        {application.metadata && Object.keys(application.metadata).length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Additional Information</h4>
            <div className="bg-gray-50 rounded-md p-3">
              <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                {JSON.stringify(application.metadata, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Error Information */}
        {application.lastError && (
          <div>
            <h4 className="text-sm font-medium text-red-900 mb-3">Last Error</h4>
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-700">{application.lastError}</p>
              {application.retries > 0 && (
                <p className="text-xs text-red-600 mt-1">
                  Retries: {application.retries}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

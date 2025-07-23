import React, { useState } from 'react'
import { 
  FunnelIcon, 
  XMarkIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

const PLATFORMS = [
  { value: 'all', label: 'All Platforms' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'indeed', label: 'Indeed' },
  { value: 'naukri', label: 'Naukri.com' },
  { value: 'monster', label: 'Monster' },
  { value: 'glassdoor', label: 'Glassdoor' }
]

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'applied', label: 'Applied' },
  { value: 'reviewing', label: 'Under Review' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'failed', label: 'Failed' }
]

const DATE_RANGES = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 3 months' },
  { value: '1y', label: 'Last year' },
  { value: 'custom', label: 'Custom range' }
]

export default function ApplicationFilters({ filters, onFilterChange }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [localFilters, setLocalFilters] = useState(filters)
  const [showCustomDate, setShowCustomDate] = useState(false)

  const handleFilterUpdate = (key, value) => {
    const updatedFilters = {
      ...localFilters,
      [key]: value
    }
    setLocalFilters(updatedFilters)
    onFilterChange(updatedFilters)

    // Show custom date inputs if custom range is selected
    if (key === 'dateRange' && value === 'custom') {
      setShowCustomDate(true)
    } else if (key === 'dateRange' && value !== 'custom') {
      setShowCustomDate(false)
    }
  }

  const clearFilters = () => {
    const clearedFilters = {
      platform: 'all',
      status: 'all',
      dateRange: '30d',
      search: '',
      startDate: '',
      endDate: ''
    }
    setLocalFilters(clearedFilters)
    setShowCustomDate(false)
    onFilterChange(clearedFilters)
  }

  const hasActiveFilters = () => {
    return localFilters.platform !== 'all' || 
           localFilters.status !== 'all' || 
           localFilters.dateRange !== '30d' || 
           localFilters.search !== ''
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (localFilters.platform !== 'all') count++
    if (localFilters.status !== 'all') count++
    if (localFilters.dateRange !== '30d') count++
    if (localFilters.search !== '') count++
    return count
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <h3 className="text-sm font-medium text-gray-900">Filters</h3>
            {hasActiveFilters() && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                {getActiveFilterCount()} active
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters() && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear all
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              {isExpanded ? 'Less filters' : 'More filters'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Jobs
          </label>
          <input
            type="text"
            value={localFilters.search || ''}
            onChange={(e) => handleFilterUpdate('search', e.target.value)}
            placeholder="Search by job title, company, or keywords..."
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>

        {/* Quick Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Platform Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <BuildingOfficeIcon className="inline h-4 w-4 mr-1" />
              Platform
            </label>
            <select
              value={localFilters.platform || 'all'}
              onChange={(e) => handleFilterUpdate('platform', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              {PLATFORMS.map((platform) => (
                <option key={platform.value} value={platform.value}>
                  {platform.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <ChartBarIcon className="inline h-4 w-4 mr-1" />
              Status
            </label>
            <select
              value={localFilters.status || 'all'}
              onChange={(e) => handleFilterUpdate('status', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <CalendarIcon className="inline h-4 w-4 mr-1" />
              Date Range
            </label>
            <select
              value={localFilters.dateRange || '30d'}
              onChange={(e) => handleFilterUpdate('dateRange', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              {DATE_RANGES.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom Date Range */}
        {showCustomDate && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-gray-50 rounded-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={localFilters.startDate || ''}
                onChange={(e) => handleFilterUpdate('startDate', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={localFilters.endDate || ''}
                onChange={(e) => handleFilterUpdate('endDate', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>
        )}

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="pt-4 border-t border-gray-200 space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Advanced Filters</h4>
            
            {/* Salary Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Salary
                </label>
                <input
                  type="number"
                  value={localFilters.minSalary || ''}
                  onChange={(e) => handleFilterUpdate('minSalary', e.target.value)}
                  placeholder="50000"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Salary
                </label>
                <input
                  type="number"
                  value={localFilters.maxSalary || ''}
                  onChange={(e) => handleFilterUpdate('maxSalary', e.target.value)}
                  placeholder="150000"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience Level
              </label>
              <select
                value={localFilters.experienceLevel || 'all'}
                onChange={(e) => handleFilterUpdate('experienceLevel', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="all">All Levels</option>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="lead">Lead/Principal</option>
                <option value="executive">Executive</option>
              </select>
            </div>

            {/* Job Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Type
              </label>
              <div className="space-y-2">
                {['full-time', 'part-time', 'contract', 'freelance', 'internship'].map((type) => (
                  <label key={type} className="inline-flex items-center mr-6">
                    <input
                      type="checkbox"
                      checked={localFilters.jobTypes?.includes(type) || false}
                      onChange={(e) => {
                        const currentTypes = localFilters.jobTypes || []
                        const updatedTypes = e.target.checked
                          ? [...currentTypes, type]
                          : currentTypes.filter(t => t !== type)
                        handleFilterUpdate('jobTypes', updatedTypes)
                      }}
                      className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">
                      {type.replace('-', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Applied Filters Display */}
      {hasActiveFilters() && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-2">
            {localFilters.platform !== 'all' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Platform: {PLATFORMS.find(p => p.value === localFilters.platform)?.label}
                <button
                  onClick={() => handleFilterUpdate('platform', 'all')}
                  className="ml-1 text-blue-600 hover:text-blue-500"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            {localFilters.status !== 'all' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Status: {STATUS_OPTIONS.find(s => s.value === localFilters.status)?.label}
                <button
                  onClick={() => handleFilterUpdate('status', 'all')}
                  className="ml-1 text-green-600 hover:text-green-500"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            {localFilters.search && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Search: "{localFilters.search}"
                <button
                  onClick={() => handleFilterUpdate('search', '')}
                  className="ml-1 text-purple-600 hover:text-purple-500"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

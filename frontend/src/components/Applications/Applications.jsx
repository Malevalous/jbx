import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { applicationsService } from '../../services/applications'
import ApplicationTable from './ApplicationTable'
import ApplicationFilters from './ApplicationFilters'
import ApplicationDetails from './ApplicationDetails'

export default function Applications() {
  const [filters, setFilters] = useState({
    platform: 'all',
    status: 'all',
    dateRange: '30d',
    search: ''
  })
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  const { data, isLoading, error } = useQuery(
    ['applications', filters, currentPage],
    () => applicationsService.getApplications({ ...filters, page: currentPage }),
    { keepPreviousData: true }
  )

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  if (error) {
    return <div className="text-red-600">Error loading applications</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Applications</h1>
          <p className="mt-1 text-sm text-gray-600">
            Track and manage your job applications
          </p>
        </div>
      </div>

      <ApplicationFilters 
        filters={filters} 
        onFilterChange={handleFilterChange} 
      />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ApplicationTable
              applications={data?.applications || []}
              onSelectApplication={setSelectedApplication}
              selectedApplication={selectedApplication}
              currentPage={currentPage}
              totalPages={data?.totalPages || 1}
              onPageChange={setCurrentPage}
            />
          </div>
          
          <div className="lg:col-span-1">
            <ApplicationDetails application={selectedApplication} />
          </div>
        </div>
      )}
    </div>
  )
}

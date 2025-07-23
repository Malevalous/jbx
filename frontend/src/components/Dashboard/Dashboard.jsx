import React from 'react'
import { useQuery } from 'react-query'
import { dashboardService } from '../../services/dashboard'  // ← Named import should now work
import { StatsCard } from './StatsCard'
import ApplicationChart from './ApplicationChart'
import RecentApplications from './RecentApplications'
import PlatformStatus from './PlatformStatus'

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery(
    'dashboard-stats',
    dashboardService.getStats
  )

  const { data: recentApps, isLoading: appsLoading } = useQuery(
    'recent-applications',
    () => dashboardService.getRecentApplications(5)
  )

  const { data: platformStats } = useQuery(
    'platform-stats',
    dashboardService.getPlatformStats
  )

  if (statsLoading || appsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Overview of your job application automation
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Applications"
          value={stats?.totalApplications || 0}
          change={stats?.applicationChange || 0}
          changeType="increase"
        />
        <StatsCard
          title="Success Rate"
          value={`${stats?.successRate || 0}%`}
          change={stats?.successChange || 0}
          changeType="increase"
        />
        <StatsCard
          title="Active Platforms"
          value={stats?.activePlatforms || 0}
          change={stats?.platformChange || 0}
          changeType="increase"
        />
        <StatsCard
          title="Pending Reviews"
          value={stats?.pendingReviews || 0}
          change={stats?.reviewChange || 0}
          changeType="decrease"
        />
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Application Trends
          </h3>
          <ApplicationChart data={stats?.chartData || []} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Platform Status
          </h3>
          <PlatformStatus platforms={platformStats || []} />
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Recent Applications
        </h3>
        <RecentApplications applications={recentApps || []} />
      </div>
    </div>
  )
}

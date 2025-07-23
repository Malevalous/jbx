import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { platformsService } from '../../services/platforms'
import PlatformCard from './PlatformCard'
import PlatformConfigModal from './PlatformConfigModal'
import { PlusIcon } from '@heroicons/react/24/outline'

const availablePlatforms = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Professional networking and job search platform',
    icon: '🔗',
    status: 'inactive'
  },
  {
    id: 'indeed',
    name: 'Indeed',
    description: 'Popular job search engine',
    icon: '💼',
    status: 'inactive'
  },
  {
    id: 'naukri',
    name: 'Naukri.com',
    description: 'Leading job portal in India',
    icon: '🇮🇳',
    status: 'inactive'
  },
  {
    id: 'monster',
    name: 'Monster',
    description: 'Global employment website',
    icon: '👹',
    status: 'inactive'
  },
  {
    id: 'glassdoor',
    name: 'Glassdoor',
    description: 'Job search and company reviews',
    icon: '🚪',
    status: 'inactive'
  }
]

export default function Platforms() {
  const [selectedPlatform, setSelectedPlatform] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: platforms, isLoading } = useQuery(
    'platforms',
    platformsService.getPlatforms
  )

  const updatePlatformMutation = useMutation(
    ({ platformId, config }) => platformsService.updatePlatform(platformId, config),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('platforms')
        setIsModalOpen(false)
        setSelectedPlatform(null)
      }
    }
  )

  const handleConfigurePlatform = (platform) => {
    setSelectedPlatform(platform)
    setIsModalOpen(true)
  }

  const handleSaveConfiguration = (config) => {
    updatePlatformMutation.mutate({
      platformId: selectedPlatform.id,
      config
    })
  }

  // Merge available platforms with user configurations
  const platformsWithConfig = availablePlatforms.map(platform => {
    const userConfig = platforms?.find(p => p.platformId === platform.id)
    return {
      ...platform,
      ...userConfig,
      status: userConfig?.isActive ? 'active' : 'inactive',
      credentials: userConfig?.credentials || {},
      searchSettings: userConfig?.searchSettings || {}
    }
  })

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Platforms</h1>
        <p className="mt-1 text-sm text-gray-600">
          Configure job platforms and their login credentials
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {platformsWithConfig.map((platform) => (
          <PlatformCard
            key={platform.id}
            platform={platform}
            onConfigure={() => handleConfigurePlatform(platform)}
          />
        ))}
      </div>

      {/* Configuration Modal */}
      <PlatformConfigModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedPlatform(null)
        }}
        platform={selectedPlatform}
        onSave={handleSaveConfiguration}
        isLoading={updatePlatformMutation.isLoading}
      />
    </div>
  )
}

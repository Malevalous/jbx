import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import ProfileSettings from './ProfileSettings'
import AutomationSettings from './AutomationSettings'
import NotificationSettings from './NotificationSettings'
import { 
  UserIcon, 
  CogIcon, 
  BellIcon 
} from '@heroicons/react/24/outline'

const tabs = [
  { name: 'Profile', icon: UserIcon, component: ProfileSettings },
  { name: 'Automation', icon: CogIcon, component: AutomationSettings },
  { name: 'Notifications', icon: BellIcon, component: NotificationSettings },
]

export default function Settings() {
  const [activeTab, setActiveTab] = useState('Profile')
  const { user } = useAuth()

  const ActiveComponent = tabs.find(tab => tab.name === activeTab)?.component

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your account and application preferences
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.name
            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`${
                  isActive
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {ActiveComponent && <ActiveComponent user={user} />}
        </div>
      </div>
    </div>
  )
}

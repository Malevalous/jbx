import React from 'react'
import { 
  ArrowUpIcon, 
  ArrowDownIcon 
} from '@heroicons/react/24/outline'

function StatsCard({ title, value, change, changeType, icon: Icon }) {
  const isIncrease = changeType === 'increase'
  const changeColor = isIncrease ? 'text-green-600' : 'text-red-600'
  const ChangeTrendIcon = isIncrease ? ArrowUpIcon : ArrowDownIcon
  const changeText = Math.abs(change || 0)

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {Icon && (
              <Icon className="h-6 w-6 text-gray-400" />
            )}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="text-lg font-medium text-gray-900">
                {value}
              </dd>
            </dl>
          </div>
        </div>
      </div>
      {change !== undefined && change !== 0 && (
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <div className={`flex items-center ${changeColor}`}>
              <ChangeTrendIcon className="flex-shrink-0 self-center h-4 w-4" />
              <span className="ml-1 font-medium">
                {changeText}%
              </span>
              <span className="ml-1 text-gray-500">
                {isIncrease ? 'increase' : 'decrease'} from last period
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// This is the critical line that was missing
export { StatsCard }


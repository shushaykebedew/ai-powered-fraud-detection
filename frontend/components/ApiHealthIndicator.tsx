'use client'

import React from 'react'
import { CheckCircle, AlertTriangle, Zap, Shield } from 'lucide-react'
import clsx from 'clsx'

interface HealthStatus {
  status: string
  model_loaded: boolean
  scaler_loaded: boolean
  api_version: string
}

interface ApiHealthIndicatorProps {
  healthStatus: HealthStatus | null
}

export default function ApiHealthIndicator({ healthStatus }: ApiHealthIndicatorProps) {
  if (!healthStatus) {
    return (
      <div className="inline-flex items-center px-4 py-3 rounded-2xl bg-slate-100 text-slate-600 border border-slate-200">
        <div className="w-3 h-3 bg-slate-400 rounded-full mr-3 animate-pulse" />
        <span className="text-sm font-medium">API Status Unknown</span>
      </div>
    )
  }

  const isHealthy = healthStatus.status === 'healthy' && healthStatus.model_loaded

  return (
    <div className={clsx(
      'inline-flex items-center px-4 py-3 rounded-2xl text-sm font-medium border-2 transition-all duration-300',
      isHealthy 
        ? 'bg-green-50 text-green-800 border-green-200 shadow-sm' 
        : 'bg-red-50 text-red-800 border-red-200 shadow-sm'
    )}>
      <div className="flex items-center space-x-3">
        <div className={clsx(
          'p-1.5 rounded-xl',
          isHealthy ? 'bg-green-500' : 'bg-red-500'
        )}>
          {isHealthy ? (
            <CheckCircle className="w-4 h-4 text-white" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-white" />
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Zap className="w-4 h-4" />
            <span>API {healthStatus.status}</span>
          </div>
          
          <div className="w-1 h-4 bg-slate-300 rounded-full"></div>
          
          <div className="flex items-center space-x-1">
            <Shield className="w-4 h-4" />
            <span>Model {healthStatus.model_loaded ? 'Ready' : 'Loading'}</span>
          </div>
          
          <div className="w-1 h-4 bg-slate-300 rounded-full"></div>
          
          <span className="text-xs bg-slate-200 px-2 py-1 rounded-full">
            v{healthStatus.api_version}
          </span>
        </div>
      </div>
      
      {isHealthy && (
        <div className="ml-3 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      )}
    </div>
  )
}
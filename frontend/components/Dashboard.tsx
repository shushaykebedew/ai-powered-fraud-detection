'use client'

import React, { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Shield,
  Zap,
  Users,
  Target
} from 'lucide-react'

interface DashboardStats {
  totalTransactions: number
  fraudDetected: number
  legitimateTransactions: number
  averageAmount: number
  fraudRate: number
  recentActivity: Array<{
    id: string
    amount: number
    status: 'fraud' | 'legitimate'
    timestamp: string
    riskLevel: string
  }>
}

interface DashboardProps {
  stats?: DashboardStats
}

export default function Dashboard({ stats }: DashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Enhanced mock data
  const mockStats: DashboardStats = {
    totalTransactions: 12847,
    fraudDetected: 234,
    legitimateTransactions: 12613,
    averageAmount: 186.78,
    fraudRate: 1.82,
    recentActivity: [
      {
        id: 'TXN-2024-001',
        amount: 3200,
        status: 'fraud',
        timestamp: '2 minutes ago',
        riskLevel: 'High'
      },
      {
        id: 'TXN-2024-002',
        amount: 89.50,
        status: 'legitimate',
        timestamp: '5 minutes ago',
        riskLevel: 'Low'
      },
      {
        id: 'TXN-2024-003',
        amount: 450,
        status: 'legitimate',
        timestamp: '8 minutes ago',
        riskLevel: 'Medium'
      },
      {
        id: 'TXN-2024-004',
        amount: 1850,
        status: 'fraud',
        timestamp: '12 minutes ago',
        riskLevel: 'High'
      },
      {
        id: 'TXN-2024-005',
        amount: 67.25,
        status: 'legitimate',
        timestamp: '15 minutes ago',
        riskLevel: 'Low'
      }
    ]
  }

  const displayStats = stats || mockStats

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    trendValue, 
    color = 'blue',
    subtitle 
  }: {
    title: string
    value: string | number
    icon: any
    trend?: 'up' | 'down'
    trendValue?: string
    color?: 'blue' | 'green' | 'red' | 'purple'
    subtitle?: string
  }) => {
    const colorClasses = {
      blue: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white',
      green: 'bg-gradient-to-br from-green-500 to-emerald-600 text-white',
      red: 'bg-gradient-to-br from-red-500 to-pink-600 text-white',
      purple: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white'
    }

    return (
      <div className="card card-elevated animate-scale-in">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
              <p className="text-3xl font-bold text-slate-900 mb-2">{value}</p>
              {subtitle && (
                <p className="text-sm text-slate-500 mb-3">{subtitle}</p>
              )}
              {trend && trendValue && (
                <div className={`flex items-center text-sm font-medium ${
                  trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  {trendValue}
                </div>
              )}
            </div>
            <div className={`p-4 rounded-2xl ${colorClasses[color]} shadow-lg`}>
              <Icon className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-lg text-slate-600">Real-time fraud detection insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-slate-500">Last updated</p>
            <p className="text-sm font-medium text-slate-700">
              {currentTime.toLocaleTimeString()}
            </p>
          </div>
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Transactions"
          value={displayStats.totalTransactions.toLocaleString()}
          icon={BarChart3}
          trend="up"
          trendValue="+12% from last week"
          color="blue"
          subtitle="All processed transactions"
        />
        
        <StatCard
          title="Fraud Detected"
          value={displayStats.fraudDetected}
          icon={AlertTriangle}
          trend="down"
          trendValue="-5% from last week"
          color="red"
          subtitle={`${displayStats.fraudRate}% fraud rate`}
        />
        
        <StatCard
          title="Legitimate"
          value={displayStats.legitimateTransactions.toLocaleString()}
          icon={CheckCircle}
          trend="up"
          trendValue="+8% from last week"
          color="green"
          subtitle="Verified safe transactions"
        />
        
        <StatCard
          title="Average Amount"
          value={`$${displayStats.averageAmount}`}
          icon={DollarSign}
          trend="up"
          trendValue="+3% from last week"
          color="purple"
          subtitle="Per transaction"
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Fraud Rate Chart */}
        <div className="lg:col-span-2">
          <div className="card card-elevated">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Fraud Detection Rate</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-slate-600">Fraud</span>
                  <div className="w-3 h-3 bg-green-500 rounded-full ml-4"></div>
                  <span className="text-sm text-slate-600">Legitimate</span>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Fraud Rate</span>
                  <span className="text-sm text-slate-500">{displayStats.fraudRate}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill bg-gradient-to-r from-red-500 to-pink-600"
                    style={{ width: `${displayStats.fraudRate * 5}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Legitimate Rate</span>
                  <span className="text-sm text-slate-500">{(100 - displayStats.fraudRate).toFixed(2)}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill bg-gradient-to-r from-green-500 to-emerald-600"
                    style={{ width: `${100 - displayStats.fraudRate}%` }}
                  />
                </div>
              </div>
              
              {/* Mini Chart Visualization */}
              <div className="mt-8 p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl">
                <h4 className="text-sm font-medium text-slate-700 mb-4">24-Hour Activity</h4>
                <div className="flex items-end space-x-1 h-20">
                  {Array.from({ length: 24 }, (_, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-blue-400 to-blue-500 rounded-t opacity-70 hover:opacity-100 transition-opacity"
                      style={{ 
                        height: `${Math.random() * 60 + 20}%`,
                        backgroundColor: Math.random() > 0.9 ? '#ef4444' : '#3b82f6'
                      }}
                      title={`${i}:00 - ${Math.floor(Math.random() * 100)} transactions`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                  <span>00:00</span>
                  <span>06:00</span>
                  <span>12:00</span>
                  <span>18:00</span>
                  <span>23:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card card-elevated">
          <div className="card-header">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Recent Activity</h3>
            </div>
          </div>
          <div className="card-body p-0">
            <div className="space-y-0">
              {displayStats.recentActivity.map((activity, index) => (
                <div 
                  key={activity.id} 
                  className="p-6 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors animate-slide-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        activity.status === 'fraud' 
                          ? 'bg-red-100 text-red-600' 
                          : 'bg-green-100 text-green-600'
                      }`}>
                        {activity.status === 'fraud' ? (
                          <AlertTriangle className="w-4 h-4" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          ${activity.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500">{activity.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        activity.riskLevel === 'High' ? 'bg-red-100 text-red-800' :
                        activity.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {activity.riskLevel}
                      </span>
                      <p className="text-xs text-slate-500 mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Model Status</h4>
                <p className="text-sm text-slate-600">AI model is running optimally</p>
                <div className="flex items-center mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-xs text-green-600 font-medium">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Processing Speed</h4>
                <p className="text-sm text-slate-600">Average response time</p>
                <div className="flex items-center mt-2">
                  <span className="text-lg font-bold text-blue-600">127ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Accuracy Rate</h4>
                <p className="text-sm text-slate-600">Model prediction accuracy</p>
                <div className="flex items-center mt-2">
                  <span className="text-lg font-bold text-purple-600">94.2%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
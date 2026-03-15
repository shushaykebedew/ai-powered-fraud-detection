'use client'

import React, { useState } from 'react'
import { 
  FileText, 
  Download, 
  Calendar, 
  BarChart3, 
  PieChart, 
  TrendingUp,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Users,
  Clock
} from 'lucide-react'

interface ReportData {
  period: string
  totalTransactions: number
  fraudCount: number
  legitimateCount: number
  fraudRate: number
  totalAmount: number
  fraudAmount: number
  avgTransactionAmount: number
  topMerchantCategories: Array<{
    category: string
    count: number
    fraudRate: number
  }>
  hourlyDistribution: Array<{
    hour: number
    transactions: number
    fraudCount: number
  }>
  riskDistribution: {
    low: number
    medium: number
    high: number
  }
}

interface ReportsProps {
  data?: ReportData
}

export default function Reports({ data }: ReportsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'24h' | '7d' | '30d' | '90d'>('7d')
  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'trends'>('summary')
  const [isGenerating, setIsGenerating] = useState(false)

  // Mock data if no data provided
  const mockData: ReportData = {
    period: '7 days',
    totalTransactions: 8742,
    fraudCount: 156,
    legitimateCount: 8586,
    fraudRate: 1.78,
    totalAmount: 1247832.50,
    fraudAmount: 89234.75,
    avgTransactionAmount: 142.67,
    topMerchantCategories: [
      { category: 'online', count: 2341, fraudRate: 3.2 },
      { category: 'retail', count: 1876, fraudRate: 1.8 },
      { category: 'restaurant', count: 1654, fraudRate: 0.9 },
      { category: 'grocery', count: 1432, fraudRate: 0.5 },
      { category: 'gas', count: 987, fraudRate: 1.2 }
    ],
    hourlyDistribution: [
      { hour: 0, transactions: 45, fraudCount: 2 },
      { hour: 1, transactions: 32, fraudCount: 1 },
      { hour: 2, transactions: 28, fraudCount: 1 },
      { hour: 3, transactions: 21, fraudCount: 0 },
      { hour: 4, transactions: 19, fraudCount: 0 },
      { hour: 5, transactions: 34, fraudCount: 1 },
      { hour: 6, transactions: 67, fraudCount: 2 },
      { hour: 7, transactions: 123, fraudCount: 3 },
      { hour: 8, transactions: 189, fraudCount: 5 },
      { hour: 9, transactions: 234, fraudCount: 8 },
      { hour: 10, transactions: 267, fraudCount: 9 },
      { hour: 11, transactions: 298, fraudCount: 12 },
      { hour: 12, transactions: 345, fraudCount: 15 },
      { hour: 13, transactions: 367, fraudCount: 18 },
      { hour: 14, transactions: 389, fraudCount: 21 },
      { hour: 15, transactions: 412, fraudCount: 19 },
      { hour: 16, transactions: 398, fraudCount: 17 },
      { hour: 17, transactions: 356, fraudCount: 14 },
      { hour: 18, transactions: 298, fraudCount: 11 },
      { hour: 19, transactions: 234, fraudCount: 8 },
      { hour: 20, transactions: 189, fraudCount: 6 },
      { hour: 21, transactions: 145, fraudCount: 4 },
      { hour: 22, transactions: 98, fraudCount: 3 },
      { hour: 23, transactions: 67, fraudCount: 2 }
    ],
    riskDistribution: {
      low: 7234,
      medium: 1352,
      high: 156
    }
  }

  const displayData = data || mockData

  const handleGenerateReport = async () => {
    setIsGenerating(true)
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsGenerating(false)
  }

  const handleExportReport = (format: 'pdf' | 'csv' | 'excel') => {
    // Simulate export
    console.log(`Exporting report as ${format}`)
    // In real implementation, this would trigger a download
  }

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
    color?: 'blue' | 'green' | 'red' | 'yellow'
    subtitle?: string
  }) => {
    const colorClasses = {
      blue: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white',
      green: 'bg-gradient-to-br from-green-500 to-emerald-600 text-white',
      red: 'bg-gradient-to-br from-red-500 to-pink-600 text-white',
      yellow: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white'
    }

    return (
      <div className="card card-elevated animate-scale-in">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600">{title}</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
              {subtitle && (
                <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
              )}
              {trend && trendValue && (
                <div className={`flex items-center mt-2 text-sm font-medium ${
                  trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendingUp className={`w-4 h-4 mr-1 ${trend === 'down' ? 'rotate-180' : ''}`} />
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

  const ChartCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="card card-elevated animate-fade-in">
      <div className="card-header">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      </div>
      <div className="card-body">
        {children}
      </div>
    </div>
  )

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Reports & Analytics</h1>
          <p className="text-lg text-slate-600">Comprehensive fraud detection insights</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleGenerateReport()}
            disabled={isGenerating}
            className="btn-secondary flex items-center space-x-2"
          >
            {isGenerating ? (
              <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>{isGenerating ? 'Generating...' : 'Refresh'}</span>
          </button>
          
          <div className="relative">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="form-input pr-10"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="card card-elevated animate-scale-in">
        <div className="card-body">
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-2xl">
            {[
              { id: 'summary', label: 'Summary', icon: BarChart3 },
              { id: 'detailed', label: 'Detailed', icon: FileText },
              { id: 'trends', label: 'Trends', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setReportType(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all font-medium ${
                  reportType === tab.id
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Transactions"
          value={displayData.totalTransactions.toLocaleString()}
          icon={BarChart3}
          trend="up"
          trendValue="+12% vs previous period"
          color="blue"
          subtitle={`${displayData.period} period`}
        />
        
        <StatCard
          title="Fraud Detected"
          value={displayData.fraudCount}
          icon={AlertTriangle}
          trend="down"
          trendValue="-5% vs previous period"
          color="red"
          subtitle={`${displayData.fraudRate}% fraud rate`}
        />
        
        <StatCard
          title="Total Amount"
          value={`$${displayData.totalAmount.toLocaleString()}`}
          icon={DollarSign}
          trend="up"
          trendValue="+8% vs previous period"
          color="green"
          subtitle={`$${displayData.avgTransactionAmount} avg`}
        />
        
        <StatCard
          title="Fraud Amount"
          value={`$${displayData.fraudAmount.toLocaleString()}`}
          icon={AlertTriangle}
          trend="down"
          trendValue="-15% vs previous period"
          color="yellow"
          subtitle="Prevented losses"
        />
      </div>

      {reportType === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk Distribution */}
          <ChartCard title="Risk Distribution">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Low Risk</span>
                <span className="text-sm text-gray-500">{displayData.riskDistribution.low}</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill bg-green-500"
                  style={{ width: `${(displayData.riskDistribution.low / displayData.totalTransactions) * 100}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Medium Risk</span>
                <span className="text-sm text-gray-500">{displayData.riskDistribution.medium}</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill bg-yellow-500"
                  style={{ width: `${(displayData.riskDistribution.medium / displayData.totalTransactions) * 100}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">High Risk</span>
                <span className="text-sm text-gray-500">{displayData.riskDistribution.high}</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill bg-red-500"
                  style={{ width: `${(displayData.riskDistribution.high / displayData.totalTransactions) * 100}%` }}
                />
              </div>
            </div>
          </ChartCard>

          {/* Top Merchant Categories */}
          <ChartCard title="Top Merchant Categories">
            <div className="space-y-3">
              {displayData.topMerchantCategories.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 capitalize">{category.category}</p>
                      <p className="text-sm text-gray-500">{category.count} transactions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      category.fraudRate > 2 ? 'text-red-600' : 
                      category.fraudRate > 1 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {category.fraudRate}%
                    </p>
                    <p className="text-xs text-gray-500">fraud rate</p>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      )}

      {reportType === 'detailed' && (
        <div className="space-y-6">
          {/* Hourly Distribution */}
          <ChartCard title="Hourly Transaction Distribution">
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-1">
                {displayData.hourlyDistribution.map((hour) => (
                  <div key={hour.hour} className="text-center">
                    <div 
                      className="bg-blue-200 rounded-t"
                      style={{ 
                        height: `${Math.max(4, (hour.transactions / 400) * 100)}px`,
                        backgroundColor: hour.fraudCount > 10 ? '#ef4444' : 
                                       hour.fraudCount > 5 ? '#f59e0b' : '#3b82f6'
                      }}
                      title={`${hour.hour}:00 - ${hour.transactions} transactions, ${hour.fraudCount} fraud`}
                    />
                    <div className="text-xs text-gray-500 mt-1">{hour.hour}</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>23:00</span>
              </div>
            </div>
          </ChartCard>

          {/* Detailed Statistics Table */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Detailed Statistics</h3>
            </div>
            <div className="card-body p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metric</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Change</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">Detection Accuracy</td>
                      <td className="px-6 py-4 text-sm text-gray-500">94.2%</td>
                      <td className="px-6 py-4 text-sm text-green-600">+2.1%</td>
                      <td className="px-6 py-4">
                        <span className="status-indicator status-online">Excellent</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">False Positive Rate</td>
                      <td className="px-6 py-4 text-sm text-gray-500">3.8%</td>
                      <td className="px-6 py-4 text-sm text-red-600">+0.5%</td>
                      <td className="px-6 py-4">
                        <span className="status-indicator status-warning">Monitor</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">Processing Time</td>
                      <td className="px-6 py-4 text-sm text-gray-500">127ms avg</td>
                      <td className="px-6 py-4 text-sm text-green-600">-15ms</td>
                      <td className="px-6 py-4">
                        <span className="status-indicator status-online">Good</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">Model Confidence</td>
                      <td className="px-6 py-4 text-sm text-gray-500">87.3%</td>
                      <td className="px-6 py-4 text-sm text-green-600">+1.2%</td>
                      <td className="px-6 py-4">
                        <span className="status-indicator status-online">High</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {reportType === 'trends' && (
        <div className="space-y-6">
          <ChartCard title="Fraud Trends Over Time">
            <div className="text-center py-12 text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Advanced trend analysis coming soon</p>
              <p className="text-sm">This feature will show detailed fraud patterns and predictions</p>
            </div>
          </ChartCard>
        </div>
      )}

      {/* Export Options */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Export Report</h3>
        </div>
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Export current report data in your preferred format
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Includes all visible data and charts for the selected time period
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleExportReport('pdf')}
                className="btn-secondary flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>PDF</span>
              </button>
              <button
                onClick={() => handleExportReport('csv')}
                className="btn-secondary flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>CSV</span>
              </button>
              <button
                onClick={() => handleExportReport('excel')}
                className="btn-secondary flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Excel</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import React, { useState, useEffect } from 'react'
import { TrendingUp, Users, ShieldAlert, Activity, RefreshCw } from 'lucide-react'

// Simple functional component to draw a bar chart using heavily styled divs
const MockBarChart = ({ data, colorClass, maxVal }: { data: number[], colorClass: string, maxVal: number }) => (
  <div className="flex items-end justify-between h-full w-full space-x-2 pt-4">
    {data.map((val, i) => {
      const heightPercent = Math.max(10, Math.min(100, (val / maxVal) * 100))
      return (
        <div key={i} className="relative w-full group flex flex-col justify-end h-full">
           <div 
             className={`w-full rounded-t-sm transition-all duration-700 ease-out ${colorClass} group-hover:opacity-80`}
             style={{ height: `${heightPercent}%` }}
           ></div>
           
           {/* Tooltip on hover */}
           <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
             {val.toLocaleString()}
           </div>
        </div>
      )
    })}
  </div>
)

export default function DashboardView() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState('7d')

  // Generate some semi-random state so changing time ranges actually does something
  const [stats, setStats] = useState({
    scanned: 14233,
    volume: 8.4,
    flags: 42,
    users: 1204,
    volData: [450, 320, 580, 480, 810, 600, 750],
    riskData: [5, 12, 4, 2, 8, 15, 6]
  })

  const loadData = (range: string) => {
    setIsRefreshing(true)
    setTimeRange(range)
    
    setTimeout(() => {
      const multiplier = range === '7d' ? 1 : range === '30d' ? 4 : 12
      setStats({
        scanned: 14233 * multiplier + Math.floor(Math.random() * 500),
        volume: Number((8.4 * multiplier + Math.random()).toFixed(1)),
        flags: 42 * multiplier + Math.floor(Math.random() * 10),
        users: 1204 + Math.floor(Math.random() * 200 * multiplier),
        volData: Array.from({length: range === '7d' ? 7 : range === '30d' ? 15 : 12}, () => Math.floor(Math.random() * 800) + 200),
        riskData: Array.from({length: range === '7d' ? 7 : range === '30d' ? 15 : 12}, () => Math.floor(Math.random() * 20) + 1)
      })
      setIsRefreshing(false)
    }, 600)
  }

  const statCards = [
    { label: 'Scanned Period', value: stats.scanned.toLocaleString(), trend: '+12.5%', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Total Volume', value: `$${stats.volume}M`, trend: '+5.2%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Flags Raised', value: stats.flags.toLocaleString(), trend: '-2.4%', icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-100' },
    { label: 'Active Users', value: stats.users.toLocaleString(), trend: '+1.1%', icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Dashboard Overview</h2>
          <p className="text-sm text-slate-500 mt-1">Real-time macro transaction environment</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="bg-white border text-sm border-slate-200 rounded-lg p-1 flex">
            <button onClick={() => loadData('7d')} className={`px-3 py-1 rounded-md transition-colors ${timeRange === '7d' ? 'bg-slate-100 font-medium text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>7D</button>
            <button onClick={() => loadData('30d')} className={`px-3 py-1 rounded-md transition-colors ${timeRange === '30d' ? 'bg-slate-100 font-medium text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>30D</button>
            <button onClick={() => loadData('1y')} className={`px-3 py-1 rounded-md transition-colors ${timeRange === '1y' ? 'bg-slate-100 font-medium text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>1Y</button>
          </div>
          <button onClick={() => loadData(timeRange)} className="btn-secondary p-2 aspect-square">
             <RefreshCw className={`w-4 h-4 text-slate-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="card-clean p-5 flex items-center justify-between opacity-100 transition-opacity" style={{opacity: isRefreshing ? 0.5 : 1}}>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
              <p className={`text-xs font-medium mt-1 ${stat.trend.startsWith('+') && stat.label !== 'Flags Raised' ? 'text-green-600' : (stat.label === 'Flags Raised' && stat.trend.startsWith('-') ? 'text-green-600' : 'text-slate-500')}`}>
                {stat.trend} vs previous
              </p>
            </div>
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-clean p-6 h-80 flex flex-col transition-opacity" style={{opacity: isRefreshing ? 0.5 : 1}}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-slate-900">Transaction Volume</h3>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">Daily Sum</span>
          </div>
          <div className="flex-1 w-full border-b border-l border-slate-100 relative">
             <MockBarChart data={stats.volData} colorClass="bg-primary-500" maxVal={1000} />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-2">
            <span>Older</span>
            <span>Newer</span>
          </div>
        </div>
        
        <div className="card-clean p-6 h-80 flex flex-col transition-opacity" style={{opacity: isRefreshing ? 0.5 : 1}}>
           <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-slate-900">High Risk Anomalies Detected</h3>
            <span className="text-xs font-medium text-red-700 bg-red-50 border border-red-100 px-2 py-1 rounded">Count</span>
          </div>
          <div className="flex-1 w-full border-b border-l border-slate-100 relative">
             <MockBarChart data={stats.riskData} colorClass="bg-red-500" maxVal={30} />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-2">
            <span>Older</span>
            <span>Newer</span>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import React from 'react'
import { LayoutDashboard, ShieldCheck, History, Settings } from 'lucide-react'

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analyzer', label: 'AI Analyzer', icon: ShieldCheck },
    { id: 'history', label: 'Transaction History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="h-full bg-surface border-r border-slate-200 flex flex-col py-6">
      <div className="px-6 mb-8 flex items-center space-x-3">
        <div className="p-2 bg-primary-600 rounded-lg">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Safeguard<span className="text-primary-600">AI</span></h1>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="px-6 pb-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
          <p className="text-sm font-medium text-slate-900">Enterprise Plan</p>
          <p className="text-xs text-slate-500 mt-1">Unlimited Scans</p>
        </div>
      </div>
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import DashboardView from '@/components/DashboardView'
import AnalyzerView from '@/components/AnalyzerView'
import HistoryView from '@/components/HistoryView'
import SettingsView from '@/components/SettingsView'

const API_BASE_URL = 'http://localhost:8000'

export default function AppLayout() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const handleScan = async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error('Failed to communicate with prediction API')
    }

    return await response.json()
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <DashboardView />
      case 'analyzer': return <AnalyzerView onScan={handleScan} />
      case 'history': return <HistoryView />
      case 'settings': return <SettingsView />
      default: return <DashboardView />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Fixed Sidebar */}
      <aside className="w-64 flex-shrink-0 hidden md:block z-20">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full relative z-10">
        <div className="max-w-[1400px] mx-auto p-6 md:p-10 pb-24">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}
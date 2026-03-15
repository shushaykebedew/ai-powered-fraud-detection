'use client'

import React, { useState } from 'react'
import { 
  Shield, 
  BarChart3, 
  History, 
  Settings, 
  Bell, 
  User,
  Menu,
  X,
  FileText,
  Sparkles
} from 'lucide-react'

interface NavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
  notifications?: number
}

export default function Navigation({ activeTab, onTabChange, notifications = 0 }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigationItems = [
    {
      id: 'analyze',
      label: 'Analyze',
      icon: Shield,
      description: 'Fraud Detection',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Analytics Overview',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      id: 'history',
      label: 'History',
      icon: History,
      description: 'Transaction Log',
      gradient: 'from-green-500 to-green-600'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
      description: 'Analytics Reports',
      gradient: 'from-orange-500 to-orange-600'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'Configuration',
      gradient: 'from-stone-500 to-stone-600'
    }
  ]

  const NavItem = ({ item, isMobile = false }: { item: any, isMobile?: boolean }) => {
    const isActive = activeTab === item.id
    
    return (
      <button
        onClick={() => {
          onTabChange(item.id)
          if (isMobile) setIsMobileMenuOpen(false)
        }}
        className={`
          group relative flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 w-full
          ${isActive 
            ? 'bg-blue-600 text-white shadow-md' 
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }
        `}
      >
        <div className={`
          p-2 rounded-lg transition-all duration-200
          ${isActive 
            ? 'bg-white/20' 
            : 'bg-gray-100 group-hover:bg-white'
          }
        `}>
          <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-600'}`} />
        </div>
        <div className="text-left flex-1">
          <div className={`font-medium text-sm ${isActive ? 'text-white' : 'text-gray-700'}`}>
            {item.label}
          </div>
          {!isMobile && (
            <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
              {item.description}
            </div>
          )}
        </div>
      </button>
    )
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:block bg-white rounded-lg shadow-sm p-6 h-fit sticky top-8">
        <div className="space-y-6">
          {/* Logo */}
          <div className="text-center pb-6 border-b border-gray-200">
            <div className="inline-block bg-blue-600 p-3 rounded-lg mb-3">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">FraudGuard</h1>
            <p className="text-sm text-gray-500">AI Detection System</p>
          </div>

          {/* Navigation Items */}
          <div className="space-y-2">
            {navigationItems.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </div>

          {/* User Profile */}
          <div className="pt-6 mt-6 border-t border-gray-200">
            <div className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">Admin User</div>
                <div className="text-sm text-gray-500">Administrator</div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          {notifications > 0 && (
            <div className="px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Bell className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  {notifications} new alert{notifications !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">FraudGuard</h1>
                <p className="text-sm text-gray-500">AI Detection System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {notifications > 0 && (
                <div className="relative">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {notifications}
                  </div>
                </div>
              )}
              
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-gray-600" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <NavItem key={item.id} item={item} isMobile />
              ))}
              
              <div className="pt-4 mt-4 border-t border-gray-200">
                <div className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Admin User</div>
                    <div className="text-sm text-gray-500">Administrator</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Tab Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
          <div className="flex justify-around">
            {navigationItems.slice(0, 4).map((item) => {
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
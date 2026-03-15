'use client'

import React, { useState } from 'react'
import { 
  Settings as SettingsIcon, 
  Save, 
  RefreshCw, 
  Bell, 
  Shield, 
  Database,
  Sliders,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react'

interface SettingsProps {
  onSettingsChange?: (settings: any) => void
}

export default function Settings({ onSettingsChange }: SettingsProps) {
  const [settings, setSettings] = useState({
    // Model Settings
    fraudThreshold: 0.5,
    riskLevels: {
      low: 0.3,
      medium: 0.6,
      high: 0.8
    },
    
    // Notification Settings
    notifications: {
      emailAlerts: true,
      pushNotifications: true,
      fraudAlerts: true,
      systemAlerts: false
    },
    
    // API Settings
    api: {
      timeout: 10000,
      retryAttempts: 3,
      batchSize: 100
    },
    
    // Display Settings
    display: {
      theme: 'light',
      refreshInterval: 30,
      showProbabilities: true,
      showRecommendations: true
    }
  })

  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...(prev[category as keyof typeof prev] as any),
        [key]: value
      }
    }))
  }

  const handleNestedSettingChange = (category: string, subCategory: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...(prev[category as keyof typeof prev] as any),
        [subCategory]: {
          ...((prev[category as keyof typeof prev] as any)[subCategory] || {}),
          [key]: value
        }
      }
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveStatus('idle')
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onSettingsChange?.(settings)
      setSaveStatus('success')
      
      // Reset status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setSettings({
      fraudThreshold: 0.5,
      riskLevels: {
        low: 0.3,
        medium: 0.6,
        high: 0.8
      },
      notifications: {
        emailAlerts: true,
        pushNotifications: true,
        fraudAlerts: true,
        systemAlerts: false
      },
      api: {
        timeout: 10000,
        retryAttempts: 3,
        batchSize: 100
      },
      display: {
        theme: 'light',
        refreshInterval: 30,
        showProbabilities: true,
        showRecommendations: true
      }
    })
  }

  const SettingSection = ({ title, icon: Icon, children }: { 
    title: string, 
    icon: any, 
    children: React.ReactNode 
  }) => (
    <div className="card card-elevated animate-scale-in">
      <div className="card-header">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg">
            <Icon className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        </div>
      </div>
      <div className="card-body space-y-6">
        {children}
      </div>
    </div>
  )

  const SliderSetting = ({ 
    label, 
    value, 
    min, 
    max, 
    step, 
    onChange, 
    description 
  }: {
    label: string
    value: number
    min: number
    max: number
    step: number
    onChange: (value: number) => void
    description?: string
  }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-700">{label}</label>
        <span className="text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-full">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer slider focus:outline-none focus:ring-4 focus:ring-blue-100"
        style={{
          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((value - min) / (max - min)) * 100}%, #e2e8f0 ${((value - min) / (max - min)) * 100}%, #e2e8f0 100%)`
        }}
      />
      {description && (
        <p className="text-xs text-slate-500">{description}</p>
      )}
    </div>
  )

  const ToggleSetting = ({ 
    label, 
    checked, 
    onChange, 
    description 
  }: {
    label: string
    checked: boolean
    onChange: (checked: boolean) => void
    description?: string
  }) => (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
      <div className="flex-1">
        <label className="text-sm font-semibold text-slate-700">{label}</label>
        {description && (
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        )}
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
      </label>
    </div>
  )

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Settings</h1>
          <p className="text-lg text-slate-600">Configure fraud detection system parameters</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {saveStatus === 'success' && (
            <div className="flex items-center text-green-600 text-sm font-medium">
              <CheckCircle className="w-4 h-4 mr-1" />
              Saved successfully
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="flex items-center text-red-600 text-sm font-medium">
              <AlertTriangle className="w-4 h-4 mr-1" />
              Save failed
            </div>
          )}
          
          <button
            onClick={handleReset}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary flex items-center space-x-2"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Settings */}
        <SettingSection title="Model Configuration" icon={Shield}>
          <SliderSetting
            label="Fraud Detection Threshold"
            value={settings.fraudThreshold}
            min={0.1}
            max={0.9}
            step={0.05}
            onChange={(value) => handleSettingChange('', 'fraudThreshold', value)}
            description="Minimum probability to classify as fraud"
          />
          
          <SliderSetting
            label="Low Risk Threshold"
            value={settings.riskLevels.low}
            min={0.1}
            max={0.5}
            step={0.05}
            onChange={(value) => handleNestedSettingChange('riskLevels', '', 'low', value)}
            description="Maximum probability for low risk classification"
          />
          
          <SliderSetting
            label="Medium Risk Threshold"
            value={settings.riskLevels.medium}
            min={0.3}
            max={0.8}
            step={0.05}
            onChange={(value) => handleNestedSettingChange('riskLevels', '', 'medium', value)}
            description="Maximum probability for medium risk classification"
          />
          
          <SliderSetting
            label="High Risk Threshold"
            value={settings.riskLevels.high}
            min={0.6}
            max={1.0}
            step={0.05}
            onChange={(value) => handleNestedSettingChange('riskLevels', '', 'high', value)}
            description="Minimum probability for high risk classification"
          />
        </SettingSection>

        {/* Notification Settings */}
        <SettingSection title="Notifications" icon={Bell}>
          <ToggleSetting
            label="Email Alerts"
            checked={settings.notifications.emailAlerts}
            onChange={(value) => handleNestedSettingChange('notifications', '', 'emailAlerts', value)}
            description="Receive email notifications for important events"
          />
          
          <ToggleSetting
            label="Push Notifications"
            checked={settings.notifications.pushNotifications}
            onChange={(value) => handleNestedSettingChange('notifications', '', 'pushNotifications', value)}
            description="Browser push notifications for real-time alerts"
          />
          
          <ToggleSetting
            label="Fraud Alerts"
            checked={settings.notifications.fraudAlerts}
            onChange={(value) => handleNestedSettingChange('notifications', '', 'fraudAlerts', value)}
            description="Immediate alerts when fraud is detected"
          />
          
          <ToggleSetting
            label="System Alerts"
            checked={settings.notifications.systemAlerts}
            onChange={(value) => handleNestedSettingChange('notifications', '', 'systemAlerts', value)}
            description="Notifications for system status changes"
          />
        </SettingSection>

        {/* API Settings */}
        <SettingSection title="API Configuration" icon={Database}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Request Timeout (ms)</label>
            <input
              type="number"
              value={settings.api.timeout}
              onChange={(e) => handleNestedSettingChange('api', '', 'timeout', parseInt(e.target.value))}
              className="form-input"
              min="1000"
              max="60000"
              step="1000"
            />
            <p className="text-xs text-gray-500">Maximum time to wait for API responses</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Retry Attempts</label>
            <input
              type="number"
              value={settings.api.retryAttempts}
              onChange={(e) => handleNestedSettingChange('api', '', 'retryAttempts', parseInt(e.target.value))}
              className="form-input"
              min="1"
              max="10"
            />
            <p className="text-xs text-gray-500">Number of retry attempts for failed requests</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Batch Size</label>
            <input
              type="number"
              value={settings.api.batchSize}
              onChange={(e) => handleNestedSettingChange('api', '', 'batchSize', parseInt(e.target.value))}
              className="form-input"
              min="10"
              max="1000"
              step="10"
            />
            <p className="text-xs text-gray-500">Number of transactions to process in batch</p>
          </div>
        </SettingSection>

        {/* Display Settings */}
        <SettingSection title="Display Options" icon={Sliders}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Theme</label>
            <select
              value={settings.display.theme}
              onChange={(e) => handleNestedSettingChange('display', '', 'theme', e.target.value)}
              className="form-input"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Auto Refresh (seconds)</label>
            <input
              type="number"
              value={settings.display.refreshInterval}
              onChange={(e) => handleNestedSettingChange('display', '', 'refreshInterval', parseInt(e.target.value))}
              className="form-input"
              min="5"
              max="300"
              step="5"
            />
            <p className="text-xs text-gray-500">How often to refresh dashboard data</p>
          </div>
          
          <ToggleSetting
            label="Show Probabilities"
            checked={settings.display.showProbabilities}
            onChange={(value) => handleNestedSettingChange('display', '', 'showProbabilities', value)}
            description="Display fraud probability percentages"
          />
          
          <ToggleSetting
            label="Show Recommendations"
            checked={settings.display.showRecommendations}
            onChange={(value) => handleNestedSettingChange('display', '', 'showRecommendations', value)}
            description="Display AI-generated recommendations"
          />
        </SettingSection>
      </div>

      {/* Info Panel */}
      <div className="card card-elevated">
        <div className="card-body">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Configuration Notes</h4>
              <ul className="text-sm text-slate-600 space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Changes take effect immediately after saving</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Lower thresholds increase sensitivity but may cause more false positives</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Higher API timeouts improve reliability but may slow response times</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Notification settings require browser permissions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
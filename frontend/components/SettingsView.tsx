'use client'

import React, { useState } from 'react'
import { Save, RefreshCw, CheckCircle2 } from 'lucide-react'

export default function SettingsView() {
  const [criticalThreshold, setCriticalThreshold] = useState(85)
  const [reviewThreshold, setReviewThreshold] = useState(60)
  const [apiKey, setApiKey] = useState('sk_live_a8f9b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u')
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleRegenerate = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let newKey = 'sk_live_'
    for (let i = 0; i < 32; i++) {
       newKey += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setApiKey(newKey)
  }

  const handleSave = () => {
    setIsSaving(true)
    setShowSuccess(false)
    
    // Simulate API call to save settings
    setTimeout(() => {
      setIsSaving(false)
      setShowSuccess(true)
      
      // Hide success toast after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000)
    }, 800)
  }

  return (
    <div className="space-y-6 max-w-4xl relative">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">System Settings</h2>
        <p className="text-sm text-slate-500 mt-1">Manage AI model thresholds and integration preferences.</p>
      </div>

      {showSuccess && (
        <div className="absolute top-0 right-0 animate-slide-in bg-green-50 border border-green-200 p-4 rounded-xl shadow-lg flex items-center space-x-3 z-50">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <div className="text-sm text-green-800 font-medium">Settings saved securely.</div>
        </div>
      )}

      <div className="card-clean divide-y divide-slate-200">
        <div className="p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Risk Thresholds</h3>
          <div className="space-y-6">
            <div>
              <label className="label-clean flex justify-between">
                <span>Critical Fraud Auto-Block Threshold</span>
                <span className="text-primary-600 font-bold">{criticalThreshold}%</span>
              </label>
               <input 
                 type="range" 
                 min="0" 
                 max="100" 
                 value={criticalThreshold} 
                 onChange={(e) => setCriticalThreshold(Number(e.target.value))}
                 className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600" 
               />
               <p className="text-xs text-slate-500 mt-2">Transactions scoring above this probability will be automatically blocked by the system.</p>
            </div>
            <div className="pt-4">
              <label className="label-clean flex justify-between">
                <span>Manual Review Threshold</span>
                <span className="text-yellow-600 font-bold">{reviewThreshold}%</span>
              </label>
               <input 
                 type="range" 
                 min="0" 
                 max="100" 
                 value={reviewThreshold} 
                 onChange={(e) => setReviewThreshold(Number(e.target.value))}
                 className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-yellow-500" 
               />
               <p className="text-xs text-slate-500 mt-2">Transactions scoring between {reviewThreshold}% and {criticalThreshold}% will be flagged for manual review.</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-4">API Integration</h3>
          <div className="space-y-4">
            <div>
              <label className="label-clean">FastAPI Predict Endpoint URL</label>
              <input type="text" className="input-clean" defaultValue="http://localhost:8000/predict" />
            </div>
            <div>
              <label className="label-clean">Production API Key</label>
              <div className="flex space-x-3">
                <input type="password" className="input-clean font-mono bg-slate-50 text-slate-600" value={apiKey} readOnly />
                <button onClick={handleRegenerate} className="btn-secondary whitespace-nowrap flex items-center">
                  <RefreshCw className="w-4 h-4 mr-2" /> Regenerate
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">Use this key to authenticate external requests to the XGBoost inference engine.</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-slate-50 text-right space-x-3">
          <button className="btn-secondary" onClick={() => { setCriticalThreshold(85); setReviewThreshold(60); }}>Reset Defaults</button>
          <button onClick={handleSave} disabled={isSaving} className="btn-primary inline-flex items-center min-w-[140px] justify-center">
            {isSaving ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

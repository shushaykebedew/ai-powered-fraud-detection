'use client'

import React, { useState } from 'react'
import { ShieldAlert, CheckCircle2, Loader2 } from 'lucide-react'

interface AnalyzerViewProps {
  onScan: (data: any) => Promise<any>
}

export default function AnalyzerView({ onScan }: AnalyzerViewProps) {
  const [formData, setFormData] = useState({
    step: 1,
    type: 'TRANSFER',
    amount: 5000.00,
    oldbalance_org: 5000.00,
    newbalance_orig: 0.00,
    oldbalance_dest: 1000.00,
    newbalance_dest: 6000.00
  })

  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'type' ? value : Number(value)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsScanning(true)
    setError(null)
    setResult(null)
    
    try {
      const data = await onScan(formData)
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsScanning(false)
    }
  }

  const loadPreset = (preset: 'normal' | 'suspicious') => {
    if (preset === 'normal') {
      setFormData({
        step: 5,
        type: 'PAYMENT',
        amount: 250.00,
        oldbalance_org: 1500.00,
        newbalance_orig: 1250.00,
        oldbalance_dest: 0.00,
        newbalance_dest: 0.00
      })
    } else {
      setFormData({
        step: 40,
        type: 'TRANSFER',
        amount: 500000.00,
        oldbalance_org: 500000.00,
        newbalance_orig: 0.00,
        oldbalance_dest: 0.00,
        newbalance_dest: 0.00
      })
    }
    setResult(null)
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">AI Transaction Analyzer</h2>
        <p className="text-sm text-slate-500 mt-1">Run single transactions through the XGBoost ML model to determine fraud probability.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card-clean p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-slate-900">Transaction Details</h3>
            <div className="flex space-x-2">
              <button onClick={() => loadPreset('normal')} className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">Load Normal</button>
              <button onClick={() => loadPreset('suspicious')} className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors">Load Suspicious</button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-clean">Transaction Type</label>
                <select name="type" className="input-clean" value={formData.type} onChange={handleChange}>
                  <option value="PAYMENT">Payment</option>
                  <option value="TRANSFER">Transfer</option>
                  <option value="CASH_OUT">Cash Out</option>
                  <option value="CASH_IN">Cash In</option>
                  <option value="DEBIT">Debit</option>
                </select>
              </div>
              <div>
                <label className="label-clean">Step (Time)</label>
                <input type="number" name="step" className="input-clean" value={formData.step} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label className="label-clean">Amount ($)</label>
              <input type="number" step="0.01" name="amount" className="input-clean" value={formData.amount} onChange={handleChange} />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Origin Account</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-clean">Old Balance</label>
                  <input type="number" step="0.01" name="oldbalance_org" className="input-clean" value={formData.oldbalance_org} onChange={handleChange} />
                </div>
                <div>
                  <label className="label-clean">New Balance</label>
                  <input type="number" step="0.01" name="newbalance_orig" className="input-clean" value={formData.newbalance_orig} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mb-6">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Destination Account</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-clean">Old Balance</label>
                  <input type="number" step="0.01" name="oldbalance_dest" className="input-clean" value={formData.oldbalance_dest} onChange={handleChange} />
                </div>
                <div>
                  <label className="label-clean">New Balance</label>
                  <input type="number" step="0.01" name="newbalance_dest" className="input-clean" value={formData.newbalance_dest} onChange={handleChange} />
                </div>
              </div>
            </div>

            <button type="submit" disabled={isScanning} className="btn-primary w-full py-2.5">
              {isScanning ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing Pattern...
                </>
              ) : (
                'Run Analysis'
              )}
            </button>
          </form>
        </div>

        <div>
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 mb-4">
              <p className="font-medium text-sm">Error connecting to analysis engine</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          )}

          {result ? (
            <div className={`card-clean p-8 flex flex-col items-center justify-center text-center transition-all ${result.is_fraud ? 'bg-red-50/50 border-red-100' : 'bg-green-50/50 border-green-100'}`}>
              {result.is_fraud ? (
                <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                  <ShieldAlert className="w-10 h-10" />
                </div>
              ) : (
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
              )}
              
              <h3 className={`text-2xl font-bold mb-2 ${result.is_fraud ? 'text-red-700' : 'text-green-700'}`}>
                {result.is_fraud ? 'Fraud Detected' : 'Transaction Safe'}
              </h3>
              
              <p className="text-slate-600 mb-8">{result.message}</p>

              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Fraud Risk</p>
                  <p className="text-xl font-bold text-slate-900">{(result.fraud_probability * 100).toFixed(1)}%</p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Confidence</p>
                  <p className="text-xl font-bold text-slate-900">{(result.confidence * 100).toFixed(0)}%</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="card-clean h-[400px] flex flex-col items-center justify-center text-center p-8 border-dashed border-2 bg-slate-50/50">
              <ShieldAlert className="w-12 h-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Awaiting Input</h3>
              <p className="text-sm text-slate-500">Submit a transaction in the form to view full ML pipeline results.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

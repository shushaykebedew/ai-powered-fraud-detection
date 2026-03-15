'use client'

import React from 'react'
import { 
  AlertTriangle, 
  CheckCircle, 
  Shield, 
  Info, 
  TrendingUp, 
  Activity,
  Clock,
  Zap,
  Target,
  Loader2
} from 'lucide-react'
import clsx from 'clsx'

interface PredictionResult {
  is_fraud: boolean
  fraud_probability: number
  risk_level: string
  confidence: number
  message: string
  recommendations: string[]
  model_version: string
}

interface PredictionResultsProps {
  prediction: PredictionResult | null
  error: string | null
  isLoading: boolean
  onCheckApiHealth: () => void
}

export default function PredictionResults({ 
  prediction, 
  error, 
  isLoading, 
  onCheckApiHealth 
}: PredictionResultsProps) {
  
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'low': return 'text-green-700 bg-green-100 border-green-200'
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-200'
      case 'high': return 'text-red-700 bg-red-100 border-red-200'
      default: return 'text-slate-700 bg-slate-100 border-slate-200'
    }
  }

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'low': return <CheckCircle className="w-5 h-5" />
      case 'medium': return <AlertTriangle className="w-5 h-5" />
      case 'high': return <AlertTriangle className="w-5 h-5" />
      default: return <Shield className="w-5 h-5" />
    }
  }

  const getConfidenceLevel = (confidence: number) => {
    if (confidence > 0.8) return { label: 'Very High', color: 'text-green-600' }
    if (confidence > 0.6) return { label: 'High', color: 'text-blue-600' }
    if (confidence > 0.4) return { label: 'Medium', color: 'text-yellow-600' }
    return { label: 'Low', color: 'text-red-600' }
  }

  return (
    <div className="card card-elevated animate-scale-in">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Analysis Results</h2>
              <p className="text-sm text-slate-600">AI-powered fraud detection analysis</p>
            </div>
          </div>
          {prediction && (
            <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {prediction.model_version}
            </div>
          )}
        </div>
      </div>

      <div className="card-body">
        {error && (
          <div className="notification error mb-6 animate-slide-in">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium">Connection Error</h3>
                <p className="text-sm mt-1 opacity-90">{error}</p>
                <button
                  onClick={onCheckApiHealth}
                  className="mt-3 text-sm underline hover:no-underline transition-all"
                >
                  Check API Status
                </button>
              </div>
            </div>
          </div>
        )}

        {prediction && (
          <div className="animate-fade-in space-y-6">
            {/* Main Result Card */}
            <div className={clsx(
              'relative p-6 rounded-2xl border-2 overflow-hidden',
              prediction.is_fraud
                ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
                : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
            )}>
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSI3IiBjeT0iNyIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] bg-repeat"></div>
              </div>
              
              <div className="relative flex items-start space-x-4">
                <div className={clsx(
                  'p-3 rounded-2xl',
                  prediction.is_fraud ? 'bg-red-500' : 'bg-green-500'
                )}>
                  {prediction.is_fraud ? (
                    <AlertTriangle className="w-8 h-8 text-white" />
                  ) : (
                    <CheckCircle className="w-8 h-8 text-white" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className={clsx(
                    'text-2xl font-bold mb-2',
                    prediction.is_fraud ? 'text-red-800' : 'text-green-800'
                  )}>
                    {prediction.is_fraud ? '🚨 FRAUD DETECTED' : '✅ LEGITIMATE TRANSACTION'}
                  </h3>
                  <p className={clsx(
                    'text-base mb-4',
                    prediction.is_fraud ? 'text-red-700' : 'text-green-700'
                  )}>
                    {prediction.message}
                  </p>
                  
                  {/* Quick Stats */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-700">
                        {(prediction.fraud_probability * 100).toFixed(1)}% Risk
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-700">
                        {(prediction.confidence * 100).toFixed(0)}% Confidence
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Fraud Probability */}
              <div className="card bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="card-body">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-slate-700">Fraud Probability</h4>
                    <Target className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-3">
                    {(prediction.fraud_probability * 100).toFixed(1)}%
                  </div>
                  <div className="progress-bar">
                    <div
                      className={clsx(
                        'progress-fill transition-all duration-1000 ease-out',
                        prediction.fraud_probability > 0.6 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                        prediction.fraud_probability > 0.2 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 
                        'bg-gradient-to-r from-green-500 to-green-600'
                      )}
                      style={{ width: `${Math.max(prediction.fraud_probability * 100, 5)}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-500 mt-2">
                    Likelihood of fraudulent activity
                  </div>
                </div>
              </div>

              {/* Risk Level */}
              <div className="card bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="card-body">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-slate-700">Risk Level</h4>
                    <Shield className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className={clsx(
                    'inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold border-2 mb-3',
                    getRiskColor(prediction.risk_level)
                  )}>
                    {getRiskIcon(prediction.risk_level)}
                    <span className="ml-2">{prediction.risk_level.toUpperCase()}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Based on transaction patterns
                  </div>
                </div>
              </div>

              {/* Model Confidence */}
              <div className="card bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="card-body">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-slate-700">Model Confidence</h4>
                    <TrendingUp className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-1">
                    {(prediction.confidence * 100).toFixed(0)}%
                  </div>
                  <div className={clsx(
                    'text-sm font-medium mb-2',
                    getConfidenceLevel(prediction.confidence).color
                  )}>
                    {getConfidenceLevel(prediction.confidence).label}
                  </div>
                  <div className="text-xs text-slate-500">
                    AI model certainty level
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <div className="card-body">
                <h4 className="text-base font-bold text-blue-800 mb-4 flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  Recommended Actions
                </h4>
                <div className="space-y-3">
                  {prediction.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-3 animate-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-sm text-blue-700 leading-relaxed">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Analysis Details */}
            <div className="card bg-gradient-to-br from-slate-50 to-slate-100">
              <div className="card-body">
                <h4 className="text-base font-bold text-slate-800 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Analysis Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-slate-700 mb-2">Risk Thresholds</h5>
                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Low: &lt; 20%</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span>Medium: 20% - 60%</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>High: &gt; 60%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-slate-700 mb-2">Processing Info</h5>
                    <div className="space-y-1 text-sm text-slate-600">
                      <div>Analysis Time: &lt; 200ms</div>
                      <div>Features Analyzed: 8</div>
                      <div>Model Type: Random Forest</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!prediction && !error && !isLoading && (
          <div className="text-center py-16 animate-fade-in">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-lg opacity-20 animate-pulse-slow"></div>
              <div className="relative w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Ready for Analysis</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Enter transaction details in the form and click "Analyze for Fraud" to get AI-powered insights
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-slate-500">
              <div className="flex items-center space-x-1">
                <Zap className="w-4 h-4" />
                <span>Real-time</span>
              </div>
              <div className="flex items-center space-x-1">
                <Target className="w-4 h-4" />
                <span>High Accuracy</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4" />
                <span>Secure</span>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-16 animate-fade-in">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
              <div className="relative w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Analyzing Transaction</h3>
            <p className="text-slate-600 mb-6">
              Our AI model is processing your transaction data using advanced machine learning algorithms...
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-slate-500">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <span>Analyzing patterns</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <span>Computing risk</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <span>Generating insights</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
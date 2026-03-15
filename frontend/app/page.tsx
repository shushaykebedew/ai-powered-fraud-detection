'use client'

import React, { useState } from 'react'
import { Shield, BarChart3, History, FileText, Settings, Brain, AlertTriangle, CheckCircle, 
         TrendingUp, Target, Activity, DollarSign, Clock, Zap, Lock, 
         Search, Filter, Download, RefreshCw, Bell, Save, Info } from 'lucide-react'

interface AnalysisResult {
  isFraud: boolean
  probability: string
  riskLevel: string
}

interface Transaction {
  id: string
  amount: number
  category: string
  type: string
  timestamp: string
  status: 'fraud' | 'legitimate' | 'pending'
  riskLevel: string
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('analyze')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const handleAnalyze = () => {
    setIsLoading(true)
    setTimeout(() => {
      const fraudProb = Math.random()
      setResult({
        isFraud: fraudProb > 0.5,
        probability: (fraudProb * 100).toFixed(1),
        riskLevel: fraudProb > 0.7 ? 'High' : fraudProb > 0.3 ? 'Medium' : 'Low'
      })
      setIsLoading(false)
    }, 1500)
  }

  // Mock data for transactions
  const mockTransactions: Transaction[] = [
    { id: 'TXN001', amount: 2500, category: 'online', type: 'credit', timestamp: '2024-01-15T14:30:00Z', status: 'fraud', riskLevel: 'High' },
    { id: 'TXN002', amount: 89.50, category: 'grocery', type: 'debit', timestamp: '2024-01-15T14:25:00Z', status: 'legitimate', riskLevel: 'Low' },
    { id: 'TXN003', amount: 450, category: 'restaurant', type: 'credit', timestamp: '2024-01-15T14:20:00Z', status: 'legitimate', riskLevel: 'Medium' },
    { id: 'TXN004', amount: 1200, category: 'retail', type: 'debit', timestamp: '2024-01-15T14:15:00Z', status: 'fraud', riskLevel: 'High' },
    { id: 'TXN005', amount: 67.25, category: 'gas', type: 'debit', timestamp: '2024-01-15T14:10:00Z', status: 'legitimate', riskLevel: 'Low' },
  ]

  const filteredTransactions = mockTransactions.filter(transaction => {
    const matchesSearch = transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'fraud' && transaction.status === 'fraud') ||
                         (filterStatus === 'legitimate' && transaction.status === 'legitimate')
    return matchesSearch && matchesFilter
  })
  const renderAnalyzeContent = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 rounded-3xl p-16 text-white relative overflow-hidden">
        <div className="relative z-10 text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Brain className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-6xl font-bold mb-6">AI Fraud Detection</h1>
          <p className="text-2xl text-gray-300 max-w-3xl mx-auto mb-10">
            Advanced neural networks analyze transaction patterns in real-time to detect fraudulent activity with precision
          </p>
          <div className="flex items-center justify-center space-x-12">
            <div className="flex items-center space-x-3">
              <Target className="w-7 h-7 text-green-400" />
              <span className="text-green-400 font-semibold text-xl">99.2% Accuracy</span>
            </div>
            <div className="flex items-center space-x-3">
              <Zap className="w-7 h-7 text-yellow-400" />
              <span className="text-yellow-400 font-semibold text-xl">100ms Response</span>
            </div>
            <div className="flex items-center space-x-3">
              <Lock className="w-7 h-7 text-blue-400" />
              <span className="text-blue-400 font-semibold text-xl">Bank-Grade Security</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form and Results */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {/* Transaction Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Transaction Analysis</h2>
                <p className="text-lg text-gray-600">Enter details for fraud detection</p>
              </div>
            </div>
          </div>
          
          <div className="p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">Amount ($)</label>
                <input
                  type="number"
                  placeholder="2,500.00"
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-xl font-medium"
                />
              </div>
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">Customer Age</label>
                <input
                  type="number"
                  placeholder="35"
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-xl font-medium"
                />
              </div>
            </div>
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">Merchant Category</label>
              <select className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-xl font-medium">
                <option>Select category</option>
                <option>🛒 Grocery Store</option>
                <option>⛽ Gas Station</option>
                <option>🍽️ Restaurant</option>
                <option>💻 Online Purchase</option>
                <option>🛍️ Retail Store</option>
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">Transaction Type</label>
                <select className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-xl font-medium">
                  <option>Select type</option>
                  <option>💳 Debit Card</option>
                  <option>💎 Credit Card</option>
                  <option>🔄 Transfer</option>
                  <option>💰 Withdrawal</option>
                </select>
              </div>
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">Hour (0-23)</label>
                <input
                  type="number"
                  placeholder="14"
                  min="0"
                  max="23"
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-xl font-medium"
                />
              </div>
            </div>
            
            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 text-white font-bold py-6 px-10 rounded-xl text-2xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-7 h-7 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <Brain className="w-7 h-7" />
                  <span>Analyze Transaction</span>
                </div>
              )}
            </button>
          </div>
        </div>
        {/* Results Panel */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Analysis Results</h2>
                <p className="text-lg text-gray-600">AI-powered fraud detection</p>
              </div>
            </div>
          </div>
          
          <div className="p-10">
            {result ? (
              <div className="space-y-8">
                <div className={`p-8 rounded-2xl border-2 ${
                  result.isFraud 
                    ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200' 
                    : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                }`}>
                  <div className="flex items-center space-x-6">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                      result.isFraud ? 'bg-red-500' : 'bg-green-500'
                    }`}>
                      {result.isFraud ? (
                        <AlertTriangle className="w-8 h-8 text-white" />
                      ) : (
                        <CheckCircle className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className={`text-4xl font-bold ${
                        result.isFraud ? 'text-red-800' : 'text-green-800'
                      }`}>
                        {result.isFraud ? '🚨 FRAUD DETECTED' : '✅ LEGITIMATE'}
                      </h3>
                      <p className={`text-2xl ${
                        result.isFraud ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {result.isFraud ? 'High risk transaction flagged' : 'Transaction appears safe'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gray-50 rounded-xl">
                    <div className="text-4xl font-bold text-gray-900">{result.probability}%</div>
                    <div className="text-lg text-gray-600">Fraud Risk</div>
                  </div>
                  <div className="text-center p-6 bg-gray-50 rounded-xl">
                    <div className="text-4xl font-bold text-gray-900">{result.riskLevel}</div>
                    <div className="text-lg text-gray-600">Risk Level</div>
                  </div>
                  <div className="text-center p-6 bg-gray-50 rounded-xl">
                    <div className="text-4xl font-bold text-gray-900">95%</div>
                    <div className="text-lg text-gray-600">Confidence</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-8">
                  <Brain className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Ready for Analysis</h3>
                <p className="text-xl text-gray-600">Fill out the form and click analyze to get AI-powered fraud detection results</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
  const renderDashboard = () => (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-2xl text-gray-600">Real-time fraud detection insights</p>
        </div>
        <div className="flex items-center space-x-3 text-lg text-gray-500">
          <Clock className="w-6 h-6" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xl">Total Transactions</p>
              <p className="text-5xl font-bold">12,847</p>
              <p className="text-blue-200 text-lg">+12% from last week</p>
            </div>
            <BarChart3 className="w-12 h-12 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-8 text-white transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-xl">Fraud Detected</p>
              <p className="text-5xl font-bold">234</p>
              <p className="text-red-200 text-lg">1.82% fraud rate</p>
            </div>
            <AlertTriangle className="w-12 h-12 text-red-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 text-white transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xl">Legitimate</p>
              <p className="text-5xl font-bold">12,613</p>
              <p className="text-green-200 text-lg">98.18% safe</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-8 text-white transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xl">Accuracy Rate</p>
              <p className="text-5xl font-bold">94.2%</p>
              <p className="text-purple-200 text-lg">Model performance</p>
            </div>
            <Target className="w-12 h-12 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h3 className="text-3xl font-bold text-gray-900 mb-8">Recent Activity</h3>
        <div className="space-y-6">
          {[
            { amount: '$3,200', status: 'fraud', time: '2 min ago', risk: 'High' },
            { amount: '$89.50', status: 'safe', time: '5 min ago', risk: 'Low' },
            { amount: '$450', status: 'safe', time: '8 min ago', risk: 'Medium' },
            { amount: '$1,850', status: 'fraud', time: '12 min ago', risk: 'High' },
            { amount: '$67.25', status: 'safe', time: '15 min ago', risk: 'Low' }
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-4">
                <div className={`w-4 h-4 rounded-full ${item.status === 'fraud' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                <div>
                  <span className="font-semibold text-gray-900 text-xl">{item.amount}</span>
                  <div className="text-base text-gray-500">{item.risk} Risk</div>
                </div>
              </div>
              <span className="text-lg text-gray-500">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
  const renderHistory = () => (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-bold text-gray-900">Transaction History</h1>
          <p className="text-2xl text-gray-600">Monitor and analyze all transactions</p>
        </div>
        <button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 rounded-xl flex items-center space-x-3 transition-all transform hover:scale-105 text-lg">
          <Download className="w-6 h-6" />
          <span>Export</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-lg"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-lg"
          >
            <option value="all">All Transactions</option>
            <option value="fraud">Fraud Only</option>
            <option value="legitimate">Legitimate Only</option>
          </select>

          <select className="px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-lg">
            <option>Sort by Time</option>
            <option>Sort by Amount</option>
            <option>Sort by Risk</option>
          </select>

          <div className="flex items-center text-lg text-gray-600 bg-gray-50 rounded-xl px-6 py-4">
            <Filter className="w-6 h-6 mr-3" />
            {filteredTransactions.length} results
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-8 py-6 text-left text-lg font-semibold text-gray-700 uppercase tracking-wider">Transaction</th>
                <th className="px-8 py-6 text-left text-lg font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                <th className="px-8 py-6 text-left text-lg font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                <th className="px-8 py-6 text-left text-lg font-semibold text-gray-700 uppercase tracking-wider">Risk</th>
                <th className="px-8 py-6 text-left text-lg font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-8 py-6 text-left text-lg font-semibold text-gray-700 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`p-3 rounded-xl mr-4 ${
                        transaction.status === 'fraud' 
                          ? 'bg-red-100 text-red-600' 
                          : 'bg-green-100 text-green-600'
                      }`}>
                        {transaction.status === 'fraud' ? (
                          <AlertTriangle className="w-6 h-6" />
                        ) : (
                          <CheckCircle className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900">{transaction.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="text-lg font-bold text-gray-900">${transaction.amount.toLocaleString()}</div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="text-lg text-gray-900 capitalize font-medium">{transaction.category}</div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span className={`inline-flex items-center px-4 py-2 rounded-full text-base font-medium ${
                      transaction.riskLevel === 'High' ? 'bg-red-100 text-red-800' :
                      transaction.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {transaction.riskLevel}
                    </span>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span className={`inline-flex items-center px-4 py-2 rounded-full text-base font-medium ${
                      transaction.status === 'fraud' ? 'bg-red-100 text-red-800' :
                      transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {transaction.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-lg text-gray-500">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      {new Date(transaction.timestamp).toLocaleString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
  const renderReports = () => (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-2xl text-gray-600">Comprehensive fraud detection insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 rounded-xl flex items-center space-x-3 transition-all transform hover:scale-105 text-lg">
            <RefreshCw className="w-6 h-6" />
            <span>Refresh</span>
          </button>
          <select className="px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-lg">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-medium text-gray-600">Total Transactions</p>
              <p className="text-5xl font-bold text-gray-900 mt-2">8,742</p>
              <p className="text-lg text-gray-500 mt-2">7 days period</p>
              <div className="flex items-center mt-3 text-lg font-medium text-green-600">
                <TrendingUp className="w-6 h-6 mr-2" />
                +12% vs previous period
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg">
              <BarChart3 className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-medium text-gray-600">Fraud Detected</p>
              <p className="text-5xl font-bold text-gray-900 mt-2">156</p>
              <p className="text-lg text-gray-500 mt-2">1.78% fraud rate</p>
              <div className="flex items-center mt-3 text-lg font-medium text-red-600">
                <TrendingUp className="w-6 h-6 mr-2 rotate-180" />
                -5% vs previous period
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 shadow-lg">
              <AlertTriangle className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-medium text-gray-600">Total Amount</p>
              <p className="text-5xl font-bold text-gray-900 mt-2">$1.2M</p>
              <p className="text-lg text-gray-500 mt-2">$142.67 avg</p>
              <div className="flex items-center mt-3 text-lg font-medium text-green-600">
                <TrendingUp className="w-6 h-6 mr-2" />
                +8% vs previous period
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 shadow-lg">
              <DollarSign className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-medium text-gray-600">Fraud Amount</p>
              <p className="text-5xl font-bold text-gray-900 mt-2">$89K</p>
              <p className="text-lg text-gray-500 mt-2">Prevented losses</p>
              <div className="flex items-center mt-3 text-lg font-medium text-red-600">
                <TrendingUp className="w-6 h-6 mr-2 rotate-180" />
                -15% vs previous period
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-600 shadow-lg">
              <AlertTriangle className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">Export Report</h3>
            <p className="text-lg text-gray-600 mt-2">Export current report data in your preferred format</p>
          </div>
          <div className="flex space-x-4">
            <button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all text-lg">
              <Download className="w-5 h-5" />
              <span>PDF</span>
            </button>
            <button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all text-lg">
              <Download className="w-5 h-5" />
              <span>CSV</span>
            </button>
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all text-lg">
              <Download className="w-5 h-5" />
              <span>Excel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
  const renderSettings = () => (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-bold text-gray-900">Settings</h1>
          <p className="text-2xl text-gray-600">Configure fraud detection system parameters</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-8 py-4 rounded-xl flex items-center space-x-3 transition-all text-lg">
            <RefreshCw className="w-6 h-6" />
            <span>Reset</span>
          </button>
          <button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 rounded-xl flex items-center space-x-3 transition-all transform hover:scale-105 text-lg">
            <Save className="w-6 h-6" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Model Settings */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">Model Configuration</h3>
            </div>
          </div>
          <div className="p-10 space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-xl font-semibold text-gray-700">Fraud Detection Threshold</label>
                <span className="text-lg font-bold text-gray-900 bg-gray-100 px-4 py-2 rounded-full">0.5</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                defaultValue="0.5"
                className="w-full h-4 bg-gray-200 rounded-full appearance-none cursor-pointer"
              />
              <p className="text-base text-gray-500 mt-3">Minimum probability to classify as fraud</p>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-xl font-semibold text-gray-700">Low Risk Threshold</label>
                <span className="text-lg font-bold text-gray-900 bg-gray-100 px-4 py-2 rounded-full">0.3</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.5"
                step="0.05"
                defaultValue="0.3"
                className="w-full h-4 bg-gray-200 rounded-full appearance-none cursor-pointer"
              />
              <p className="text-base text-gray-500 mt-3">Maximum probability for low risk classification</p>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-xl font-semibold text-gray-700">High Risk Threshold</label>
                <span className="text-lg font-bold text-gray-900 bg-gray-100 px-4 py-2 rounded-full">0.8</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.0"
                step="0.05"
                defaultValue="0.8"
                className="w-full h-4 bg-gray-200 rounded-full appearance-none cursor-pointer"
              />
              <p className="text-base text-gray-500 mt-3">Minimum probability for high risk classification</p>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl shadow-lg">
                <Bell className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">Notifications</h3>
            </div>
          </div>
          <div className="p-10 space-y-8">
            {[
              { label: 'Email Alerts', description: 'Receive email notifications for important events', checked: true },
              { label: 'Push Notifications', description: 'Browser push notifications for real-time alerts', checked: true },
              { label: 'Fraud Alerts', description: 'Immediate alerts when fraud is detected', checked: true },
              { label: 'System Alerts', description: 'Notifications for system status changes', checked: false }
            ].map((setting, index) => (
              <div key={index} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl">
                <div className="flex-1">
                  <label className="text-xl font-semibold text-gray-700">{setting.label}</label>
                  <p className="text-base text-gray-500 mt-2">{setting.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={setting.checked}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <Info className="w-7 h-7" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-2xl">Configuration Notes</h4>
            <ul className="text-lg text-gray-600 space-y-3">
              <li className="flex items-start space-x-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-3 flex-shrink-0"></span>
                <span>Changes take effect immediately after saving</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-3 flex-shrink-0"></span>
                <span>Lower thresholds increase sensitivity but may cause more false positives</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-3 flex-shrink-0"></span>
                <span>Higher API timeouts improve reliability but may slow response times</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-3 flex-shrink-0"></span>
                <span>Notification settings require browser permissions</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
  const renderContent = () => {
    switch (activeTab) {
      case 'analyze': return renderAnalyzeContent()
      case 'dashboard': return renderDashboard()
      case 'history': return renderHistory()
      case 'reports': return renderReports()
      case 'settings': return renderSettings()
      default: return (
        <div className="text-center py-32">
          <h2 className="text-6xl font-bold text-gray-900 mb-6">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h2>
          <p className="text-3xl text-gray-600">Coming soon...</p>
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="w-full px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8 max-w-none">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl p-8 sticky top-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">FraudGuard</h1>
                <p className="text-base text-gray-600">AI Security</p>
              </div>

              <nav className="space-y-3">
                {[
                  { id: 'analyze', label: 'Analyze', icon: Shield, description: 'Fraud Detection', color: 'from-blue-500 to-cyan-500' },
                  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, description: 'Analytics', color: 'from-purple-500 to-pink-500' },
                  { id: 'history', label: 'History', icon: History, description: 'Transactions', color: 'from-green-500 to-emerald-500' },
                  { id: 'reports', label: 'Reports', icon: FileText, description: 'Insights', color: 'from-orange-500 to-red-500' },
                  { id: 'settings', label: 'Settings', icon: Settings, description: 'Configure', color: 'from-gray-500 to-slate-600' }
                ].map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-4 px-6 py-4 rounded-xl transition-all text-left ${
                        isActive 
                          ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-105` 
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <div>
                        <div className="font-medium text-lg">{item.label}</div>
                        <div className={`text-base ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                          {item.description}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-5">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}
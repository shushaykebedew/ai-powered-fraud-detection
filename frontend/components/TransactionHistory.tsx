'use client'

import React, { useState } from 'react'
import { 
  Search, 
  Filter, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  Clock
} from 'lucide-react'

interface Transaction {
  id: string
  amount: number
  merchant_category: string
  transaction_type: string
  timestamp: string
  customer_age: number
  is_fraud: boolean
  fraud_probability: number
  risk_level: string
  status: 'processed' | 'pending' | 'blocked'
}

interface TransactionHistoryProps {
  transactions?: Transaction[]
  onTransactionSelect?: (transaction: Transaction) => void
}

export default function TransactionHistory({ 
  transactions, 
  onTransactionSelect 
}: TransactionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'fraud' | 'legitimate'>('all')
  const [sortBy, setSortBy] = useState<'timestamp' | 'amount' | 'risk'>('timestamp')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Mock data if no transactions provided
  const mockTransactions: Transaction[] = [
    {
      id: 'TXN001',
      amount: 2500.00,
      merchant_category: 'online',
      transaction_type: 'credit',
      timestamp: '2024-01-15T14:30:00Z',
      customer_age: 22,
      is_fraud: true,
      fraud_probability: 0.89,
      risk_level: 'High',
      status: 'blocked'
    },
    {
      id: 'TXN002',
      amount: 89.50,
      merchant_category: 'grocery',
      transaction_type: 'debit',
      timestamp: '2024-01-15T14:25:00Z',
      customer_age: 35,
      is_fraud: false,
      fraud_probability: 0.12,
      risk_level: 'Low',
      status: 'processed'
    },
    {
      id: 'TXN003',
      amount: 450.00,
      merchant_category: 'restaurant',
      transaction_type: 'credit',
      timestamp: '2024-01-15T14:20:00Z',
      customer_age: 28,
      is_fraud: false,
      fraud_probability: 0.34,
      risk_level: 'Medium',
      status: 'processed'
    },
    {
      id: 'TXN004',
      amount: 1200.00,
      merchant_category: 'retail',
      transaction_type: 'debit',
      timestamp: '2024-01-15T14:15:00Z',
      customer_age: 19,
      is_fraud: true,
      fraud_probability: 0.76,
      risk_level: 'High',
      status: 'blocked'
    },
    {
      id: 'TXN005',
      amount: 67.25,
      merchant_category: 'gas',
      transaction_type: 'debit',
      timestamp: '2024-01-15T14:10:00Z',
      customer_age: 42,
      is_fraud: false,
      fraud_probability: 0.08,
      risk_level: 'Low',
      status: 'processed'
    },
    {
      id: 'TXN006',
      amount: 3200.00,
      merchant_category: 'online',
      transaction_type: 'transfer',
      timestamp: '2024-01-15T14:05:00Z',
      customer_age: 25,
      is_fraud: true,
      fraud_probability: 0.92,
      risk_level: 'High',
      status: 'blocked'
    },
    {
      id: 'TXN007',
      amount: 156.78,
      merchant_category: 'restaurant',
      transaction_type: 'credit',
      timestamp: '2024-01-15T14:00:00Z',
      customer_age: 31,
      is_fraud: false,
      fraud_probability: 0.23,
      risk_level: 'Low',
      status: 'processed'
    },
    {
      id: 'TXN008',
      amount: 890.00,
      merchant_category: 'retail',
      transaction_type: 'credit',
      timestamp: '2024-01-15T13:55:00Z',
      customer_age: 27,
      is_fraud: false,
      fraud_probability: 0.45,
      risk_level: 'Medium',
      status: 'processed'
    }
  ]

  const displayTransactions = transactions || mockTransactions

  // Filter and search logic
  const filteredTransactions = displayTransactions.filter(transaction => {
    const matchesSearch = transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.merchant_category.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'fraud' && transaction.is_fraud) ||
                         (filterStatus === 'legitimate' && !transaction.is_fraud)
    
    return matchesSearch && matchesFilter
  })

  // Sort logic
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    switch (sortBy) {
      case 'timestamp':
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      case 'amount':
        return b.amount - a.amount
      case 'risk':
        return b.fraud_probability - a.fraud_probability
      default:
        return 0
    }
  })

  // Pagination
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTransactions = sortedTransactions.slice(startIndex, startIndex + itemsPerPage)

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'grocery': return '🛒'
      case 'gas': return '⛽'
      case 'restaurant': return '🍽️'
      case 'retail': return '🛍️'
      case 'online': return '💻'
      default: return '📦'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'debit': return '💳'
      case 'credit': return '💎'
      case 'transfer': return '🔄'
      case 'withdrawal': return '💰'
      default: return '💳'
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Transaction History</h1>
          <p className="text-lg text-slate-600">Monitor and analyze all transactions</p>
        </div>
        <button className="btn-secondary flex items-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="card card-elevated animate-scale-in">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="form-input"
            >
              <option value="all">All Transactions</option>
              <option value="fraud">Fraud Only</option>
              <option value="legitimate">Legitimate Only</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="form-input"
            >
              <option value="timestamp">Sort by Time</option>
              <option value="amount">Sort by Amount</option>
              <option value="risk">Sort by Risk</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center text-sm text-slate-600 bg-slate-50 rounded-2xl px-4 py-3">
              <Filter className="w-4 h-4 mr-2" />
              {filteredTransactions.length} results
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="card card-elevated animate-fade-in">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Risk
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {paginatedTransactions.map((transaction, index) => (
                  <tr 
                    key={transaction.id}
                    className="hover:bg-slate-50/50 cursor-pointer transition-all duration-200 animate-slide-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => onTransactionSelect?.(transaction)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-xl mr-3 ${
                          transaction.is_fraud 
                            ? 'bg-red-100 text-red-600' 
                            : 'bg-green-100 text-green-600'
                        }`}>
                          {transaction.is_fraud ? (
                            <AlertTriangle className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            {transaction.id}
                          </div>
                          <div className="text-sm text-slate-500">
                            Age: {transaction.customer_age}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">
                        ${transaction.amount.toLocaleString()}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">
                          {getCategoryIcon(transaction.merchant_category)}
                        </span>
                        <div>
                          <div className="text-sm text-slate-900 capitalize font-medium">
                            {transaction.merchant_category}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center">
                            <span className="mr-1">
                              {getTypeIcon(transaction.transaction_type)}
                            </span>
                            {transaction.transaction_type}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1">
                          <div className={`status-indicator ${
                            transaction.risk_level === 'High' ? 'bg-red-100 text-red-800 border-red-200' :
                            transaction.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                            'bg-green-100 text-green-800 border-green-200'
                          }`}>
                            {transaction.risk_level}
                          </div>
                          <div className="text-xs text-slate-500 mt-1 font-medium">
                            {(transaction.fraud_probability * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`status-indicator ${
                        transaction.status === 'blocked' ? 'bg-red-100 text-red-800 border-red-200' :
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        'bg-green-100 text-green-800 border-green-200'
                      }`}>
                        {transaction.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatTimestamp(transaction.timestamp)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-700 font-medium">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedTransactions.length)} of {sortedTransactions.length} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm border border-slate-300 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 text-sm border rounded-xl transition-all ${
                        currentPage === page
                          ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                          : 'border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm border border-slate-300 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
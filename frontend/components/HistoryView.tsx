'use client'

import React, { useState } from 'react'
import { MoreVertical, Download, Filter, ChevronLeft, ChevronRight, X, Eye } from 'lucide-react'

// Extended mock database
const generateMockData = () => {
  const types = ['TRANSFER', 'PAYMENT', 'CASH_OUT', 'CASH_IN', 'DEBIT']
  const risks = ['Low', 'Medium', 'Critical']
  const statuses = ['Approved', 'Reviewing', 'Blocked']
  const out = []
  
  for (let i = 0; i < 45; i++) {
    const isCritical = Math.random() > 0.85
    const type = types[Math.floor(Math.random() * types.length)]
    
    out.push({
      id: `TXN-${90950 - i}`,
      date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().replace('T', ' ').slice(0,16),
      type: type,
      amount: isCritical ? (Math.random() * 500000 + 100000) : (Math.random() * 5000 + 10),
      risk: isCritical ? 'Critical' : risks[Math.floor(Math.random() * 2)],
      status: isCritical ? 'Blocked' : statuses[Math.floor(Math.random() * 2)]
    })
  }
  return out.sort((a,b) => b.id.localeCompare(a.id))
}

const ALL_TRANSACTIONS = generateMockData()

export default function HistoryView() {
  const [transactions, setTransactions] = useState(ALL_TRANSACTIONS)
  const [currentPage, setCurrentPage] = useState(1)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  
  // Filters
  const [filterRisk, setFilterRisk] = useState<string>('All')
  
  const itemsPerPage = 7
  
  // Derived state
  const filteredData = transactions.filter(tx => filterRisk === 'All' || tx.risk === filterRisk)
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'Low': return 'bg-green-100 text-green-700'
      case 'Medium': return 'bg-yellow-100 text-yellow-700'
      case 'Critical': return 'bg-red-100 text-red-700'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Approved': return 'text-green-600'
      case 'Blocked': return 'text-red-600 font-medium'
      case 'Reviewing': return 'text-yellow-600'
      default: return 'text-slate-600'
    }
  }

  const handleExportCSV = () => {
    // Generate CSV string
    const headers = ['Transaction ID', 'Date', 'Type', 'Amount', 'Risk', 'Status']
    const csvRows = [headers.join(',')]
    
    filteredData.forEach(tx => {
      csvRows.push([tx.id, tx.date, tx.type, tx.amount.toFixed(2), tx.risk, tx.status].join(','))
    })
    
    const csvString = csvRows.join('\n')
    const blob = new Blob([csvString], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('href', url)
    a.setAttribute('download', `transactions_export_${new Date().getTime()}.csv`)
    a.click()
  }

  const toggleFilter = () => setIsFilterOpen(!isFilterOpen)
  
  const applyFilter = (risk: string) => {
    setFilterRisk(risk)
    setCurrentPage(1) // reset page on filter change
    setIsFilterOpen(false)
  }

  const handleAction = (id: string, action: string) => {
    if (action === 'approve') {
       setTransactions(prev => prev.map(tx => tx.id === id ? {...tx, status: 'Approved', risk: 'Low'} : tx))
    } else if (action === 'block') {
       setTransactions(prev => prev.map(tx => tx.id === id ? {...tx, status: 'Blocked', risk: 'Critical'} : tx))
    }
    setActiveMenuId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center relative">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Transaction History</h2>
          <p className="text-sm text-slate-500 mt-1">Review past transactions and their AI risk assignments.</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <button onClick={toggleFilter} className={`btn-secondary flex items-center ${filterRisk !== 'All' ? 'border-primary-500 text-primary-700 bg-primary-50' : ''}`}>
              <Filter className="w-4 h-4 mr-2" /> 
              {filterRisk !== 'All' ? `Risk: ${filterRisk}` : 'Filter'}
            </button>
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden animate-fade-in">
                <div className="px-3 py-2 border-b border-slate-100 flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Filter by Risk</span>
                  <button onClick={toggleFilter} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-1">
                  {['All', 'Low', 'Medium', 'Critical'].map(r => (
                    <button 
                      key={r}
                      onClick={() => applyFilter(r)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-slate-50 ${filterRisk === r ? 'bg-primary-50 text-primary-700 font-medium' : 'text-slate-700'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button onClick={handleExportCSV} className="btn-secondary flex items-center hover:bg-slate-50">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </button>
        </div>
      </div>

      <div className="card-clean overflow-visible">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-medium">Transaction ID</th>
              <th className="px-6 py-4 font-medium">Date & Time</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Amount ($)</th>
              <th className="px-6 py-4 font-medium">AI Risk Level</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium relative"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                  No transactions found matching the current filters.
                </td>
              </tr>
            ) : currentData.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{tx.id}</td>
                <td className="px-6 py-4">{tx.date}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600 font-medium">
                    {tx.type}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">
                  ${tx.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getRiskColor(tx.risk)}`}>
                    {tx.risk}
                  </span>
                </td>
                <td className={`px-6 py-4 ${getStatusColor(tx.status)}`}>{tx.status}</td>
                <td className="px-6 py-4 text-right relative">
                  <button 
                    onClick={() => setActiveMenuId(activeMenuId === tx.id ? null : tx.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  {activeMenuId === tx.id && (
                     <div className="absolute right-8 top-4 w-40 bg-white rounded-lg shadow-lg border border-slate-200 z-10 py-1 animate-scale-in origin-top-right">
                       <button onClick={() => handleAction(tx.id, 'approve')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-green-600">Mark as Safe</button>
                       <button onClick={() => handleAction(tx.id, 'block')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-red-600">Flag & Block</button>
                     </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-sm text-slate-500">
          <span>Showing {filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries</span>
          <div className="flex space-x-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || filteredData.length === 0}
              className="px-2 py-1 border border-slate-300 rounded flex items-center hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Prev
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || filteredData.length === 0}
              className="px-2 py-1 border border-slate-300 rounded flex items-center bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

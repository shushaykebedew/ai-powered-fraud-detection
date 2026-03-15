'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  CreditCard, 
  RefreshCw, 
  DollarSign, 
  Clock, 
  Calendar,
  User,
  Building,
  AlertCircle,
  CheckCircle,
  Loader2,
  Sparkles
} from 'lucide-react'
import clsx from 'clsx'

// Form validation schema
const transactionSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0').max(1000000, 'Amount too large'),
  merchant_category: z.enum(['grocery', 'gas', 'restaurant', 'retail', 'online', 'other']),
  transaction_type: z.enum(['debit', 'credit', 'transfer', 'withdrawal']),
  hour: z.number().min(0, 'Hour must be 0-23').max(23, 'Hour must be 0-23'),
  day_of_week: z.number().min(0, 'Day must be 0-6').max(6, 'Day must be 0-6'),
  is_weekend: z.boolean(),
  customer_age: z.number().min(13, 'Age must be at least 13').max(120, 'Age must be realistic'),
  account_balance: z.number().min(0, 'Balance cannot be negative').max(10000000, 'Balance too large'),
})

export type TransactionForm = z.infer<typeof transactionSchema>

interface TransactionFormProps {
  onSubmit: (data: TransactionForm) => void
  isLoading: boolean
}

export default function TransactionForm({ onSubmit, isLoading }: TransactionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    watch
  } = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    mode: 'onChange',
    defaultValues: {
      amount: 100,
      merchant_category: 'grocery',
      transaction_type: 'debit',
      hour: 12,
      day_of_week: 1,
      is_weekend: false,
      customer_age: 30,
      account_balance: 5000,
    }
  })

  const dayOfWeek = watch('day_of_week')

  // Auto-update weekend status when day changes
  React.useEffect(() => {
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6 // Saturday (5) or Sunday (6)
    setValue('is_weekend', isWeekend)
  }, [dayOfWeek, setValue])

  const merchantCategories = [
    { value: 'grocery', label: '🛒 Grocery Store', icon: '🛒' },
    { value: 'gas', label: '⛽ Gas Station', icon: '⛽' },
    { value: 'restaurant', label: '🍽️ Restaurant', icon: '🍽️' },
    { value: 'retail', label: '🛍️ Retail Store', icon: '🛍️' },
    { value: 'online', label: '💻 Online Purchase', icon: '💻' },
    { value: 'other', label: '📦 Other', icon: '📦' }
  ]

  const transactionTypes = [
    { value: 'debit', label: 'Debit Card', icon: '💳' },
    { value: 'credit', label: 'Credit Card', icon: '💎' },
    { value: 'transfer', label: 'Bank Transfer', icon: '🔄' },
    { value: 'withdrawal', label: 'ATM Withdrawal', icon: '💰' }
  ]

  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ]

  const loadSampleData = (sampleType: 'normal' | 'suspicious') => {
    if (sampleType === 'normal') {
      setValue('amount', 85.50)
      setValue('merchant_category', 'grocery')
      setValue('transaction_type', 'debit')
      setValue('hour', 14)
      setValue('day_of_week', 2)
      setValue('is_weekend', false)
      setValue('customer_age', 35)
      setValue('account_balance', 2500)
    } else {
      setValue('amount', 2500)
      setValue('merchant_category', 'online')
      setValue('transaction_type', 'credit')
      setValue('hour', 2)
      setValue('day_of_week', 6)
      setValue('is_weekend', true)
      setValue('customer_age', 22)
      setValue('account_balance', 800)
    }
  }

  const getFieldClass = (fieldName: keyof TransactionForm) => {
    const hasError = errors[fieldName]
    if (hasError) return 'form-input error'
    return 'form-input'
  }

  return (
    <div className="card card-elevated animate-scale-in">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Transaction Analysis</h2>
              <p className="text-sm text-slate-600">Enter transaction details for fraud detection</p>
            </div>
          </div>
          
          {/* Sample Data Buttons */}
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => loadSampleData('normal')}
              className="btn-sm btn-success flex items-center space-x-1"
            >
              <CheckCircle className="w-3 h-3" />
              <span>Normal</span>
            </button>
            <button
              type="button"
              onClick={() => loadSampleData('suspicious')}
              className="btn-sm btn-danger flex items-center space-x-1"
            >
              <AlertCircle className="w-3 h-3" />
              <span>Suspicious</span>
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card-body space-y-6">
        {/* Amount */}
        <div className="form-group">
          <label className="form-label flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-slate-500" />
            <span>Transaction Amount</span>
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              {...register('amount', { valueAsNumber: true })}
              className={getFieldClass('amount')}
              placeholder="Enter amount"
            />
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <span className="text-slate-500 text-sm">$</span>
            </div>
          </div>
          {errors.amount && (
            <div className="form-error flex items-center space-x-1">
              <AlertCircle className="w-3 h-3" />
              <span>{errors.amount.message}</span>
            </div>
          )}
        </div>

        {/* Merchant Category and Transaction Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="form-label flex items-center space-x-2">
              <Building className="w-4 h-4 text-slate-500" />
              <span>Merchant Category</span>
            </label>
            <select
              {...register('merchant_category')}
              className={getFieldClass('merchant_category')}
            >
              {merchantCategories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-slate-500" />
              <span>Transaction Type</span>
            </label>
            <select
              {...register('transaction_type')}
              className={getFieldClass('transaction_type')}
            >
              {transactionTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Time Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="form-group">
            <label className="form-label flex items-center space-x-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Hour (0-23)</span>
            </label>
            <input
              type="number"
              min="0"
              max="23"
              {...register('hour', { valueAsNumber: true })}
              className={getFieldClass('hour')}
              placeholder="14"
            />
            {errors.hour && (
              <div className="form-error flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.hour.message}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>Day of Week</span>
            </label>
            <select
              {...register('day_of_week', { valueAsNumber: true })}
              className={getFieldClass('day_of_week')}
            >
              {daysOfWeek.map((day, index) => (
                <option key={index} value={index}>
                  {day} {(index === 5 || index === 6) && '(Weekend)'}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Weekend Status</label>
            <div className="flex items-center h-12 px-4 bg-slate-50 rounded-xl border-2 border-slate-200">
              <input
                type="checkbox"
                {...register('is_weekend')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
              />
              <label className="ml-3 text-sm font-medium text-slate-700">
                Weekend Transaction
              </label>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="form-label flex items-center space-x-2">
              <User className="w-4 h-4 text-slate-500" />
              <span>Customer Age</span>
            </label>
            <input
              type="number"
              min="13"
              max="120"
              {...register('customer_age', { valueAsNumber: true })}
              className={getFieldClass('customer_age')}
              placeholder="35"
            />
            {errors.customer_age && (
              <div className="form-error flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.customer_age.message}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-slate-500" />
              <span>Account Balance</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('account_balance', { valueAsNumber: true })}
              className={getFieldClass('account_balance')}
              placeholder="5000"
            />
            {errors.account_balance && (
              <div className="form-error flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.account_balance.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={isLoading || !isValid}
            className="btn-primary flex-1 flex items-center justify-center space-x-2 text-base py-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Analyzing Transaction...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Analyze for Fraud</span>
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => reset()}
            className="btn-secondary px-6 flex items-center justify-center"
            title="Reset Form"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Form Summary */}
        <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">Transaction Summary</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>Amount: ${watch('amount')?.toLocaleString() || '0'}</div>
            <div>Type: {transactionTypes.find(t => t.value === watch('transaction_type'))?.label}</div>
            <div>Category: {merchantCategories.find(c => c.value === watch('merchant_category'))?.label}</div>
            <div>Time: {watch('hour')}:00 on {daysOfWeek[watch('day_of_week')]}</div>
          </div>
        </div>
      </form>
    </div>
  )
}
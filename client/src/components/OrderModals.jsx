import React, { useState } from 'react'
import { format } from 'date-fns'
import { XMarkIcon, PrinterIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from './LoadingSpinner'

// Order Details Modal
export const OrderDetailsModal = ({ order, onClose }) => {
  const printReceipt = () => {
    // Create a printable version of the receipt
    const printContent = `
      <div style="font-family: monospace; max-width: 300px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 10px;">
          <h2 style="margin: 0;">POS System</h2>
          <p style="margin: 5px 0;">Sales Receipt</p>
        </div>
        
        <div style="margin-bottom: 10px;">
          <div><strong>Order:</strong> ${order.orderNumber}</div>
          <div><strong>Date:</strong> ${format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm')}</div>
          <div><strong>Cashier:</strong> ${order.cashierName}</div>
          ${order.customer?.name ? `<div><strong>Customer:</strong> ${order.customer.name}</div>` : ''}
        </div>
        
        <div style="border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 10px;">
          ${order.items.map(item => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <div>
                <div>${item.productName}</div>
                <div style="font-size: 12px; color: #666;">$${parseFloat(item.productPrice || 0).toFixed(2)} x ${item.quantity}</div>
              </div>
              <div>$${parseFloat(item.subtotal || 0).toFixed(2)}</div>
            </div>
          `).join('')}
        </div>
        
        <div style="margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between;">
            <span>Subtotal:</span>
            <span>$${parseFloat(order.subtotal || 0).toFixed(2)}</span>
          </div>
          ${order.discount && order.discount.amount > 0 ? `
            <div style="display: flex; justify-content: space-between; color: green;">
              <span>Discount:</span>
              <span>-$${parseFloat(order.discount.amount || 0).toFixed(2)}</span>
            </div>
          ` : ''}
          ${order.tax && order.tax.amount > 0 ? `
            <div style="display: flex; justify-content: space-between;">
              <span>Tax:</span>
              <span>+$${parseFloat(order.tax.amount || 0).toFixed(2)}</span>
            </div>
          ` : ''}
        </div>
        
        <div style="border-top: 1px solid #000; padding-top: 10px;">
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 16px;">
            <span>Total:</span>
            <span>$${parseFloat(order.total || 0).toFixed(2)}</span>
          </div>
          <div style="margin-top: 5px;">
            <strong>Payment:</strong> ${order.paymentMethod.replace('_', ' ').toUpperCase()}
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; font-size: 12px;">
          <p>Thank you for your business!</p>
        </div>
      </div>
    `
    
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${order.orderNumber}</title>
          <style>
            body { margin: 0; padding: 0; }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Order Details</h3>
              <p className="text-sm text-gray-500">{order.orderNumber}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={printReceipt}
                className="p-2 text-gray-400 hover:text-gray-500"
                title="Print Receipt"
              >
                <PrinterIcon className="h-5 w-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Order Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Order Information</h4>
                <dl className="space-y-1 text-sm">
                  <div>
                    <dt className="text-gray-500">Order Number:</dt>
                    <dd className="font-medium">{order.orderNumber}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Date & Time:</dt>
                    <dd className="font-medium">
                      {format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm:ss')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Cashier:</dt>
                    <dd className="font-medium">{order.cashierName}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Status:</dt>
                    <dd>
                      <span className={`
                        inline-flex px-2 py-1 text-xs font-semibold rounded-full
                        ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          order.status === 'refunded' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'}
                      `}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Customer Information</h4>
                <dl className="space-y-1 text-sm">
                  <div>
                    <dt className="text-gray-500">Name:</dt>
                    <dd className="font-medium">{order.customer?.name || 'Walk-in Customer'}</dd>
                  </div>
                  {order.customer?.email && (
                    <div>
                      <dt className="text-gray-500">Email:</dt>
                      <dd className="font-medium">{order.customer.email}</dd>
                    </div>
                  )}
                  {order.customer?.phone && (
                    <div>
                      <dt className="text-gray-500">Phone:</dt>
                      <dd className="font-medium">{order.customer.phone}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-gray-500">Payment Method:</dt>
                    <dd className="font-medium capitalize">
                      {order.paymentMethod.replace('_', ' ')}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Order Items</h4>
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Qty
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {item.productName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          ${parseFloat(item.productPrice || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          ${parseFloat(item.subtotal || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-md p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Order Summary</h4>
              <dl className="space-y-2">
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-600">Subtotal:</dt>
                  <dd className="font-medium">${parseFloat(order.subtotal || 0).toFixed(2)}</dd>
                </div>
                {order.discount && order.discount.amount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <dt>
                      Discount ({order.discount.type === 'percentage' ? `${order.discount.percentage}%` : 'Fixed'}):
                    </dt>
                    <dd className="font-medium">-${parseFloat(order.discount.amount || 0).toFixed(2)}</dd>
                  </div>
                )}
                {order.tax && order.tax.amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-600">Tax ({order.tax.percentage}%):</dt>
                    <dd className="font-medium">+${parseFloat(order.tax.amount || 0).toFixed(2)}</dd>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200">
                  <dt>Total:</dt>
                  <dd>${parseFloat(order.total || 0).toFixed(2)}</dd>
                </div>
              </dl>
            </div>

            {/* Refund Information */}
            {order.status === 'refunded' && order.refund && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">Refund Information</h4>
                <dl className="space-y-1 text-sm">
                  <div>
                    <dt className="text-yellow-700">Refund Amount:</dt>
                    <dd className="font-medium text-yellow-900">${parseFloat(order.refund.amount || 0).toFixed(2)}</dd>
                  </div>
                  <div>
                    <dt className="text-yellow-700">Reason:</dt>
                    <dd className="font-medium text-yellow-900">{order.refund.reason}</dd>
                  </div>
                  <div>
                    <dt className="text-yellow-700">Refunded At:</dt>
                    <dd className="font-medium text-yellow-900">
                      {format(new Date(order.refund.refundedAt), 'MMM dd, yyyy HH:mm:ss')}
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            {/* Notes */}
            {order.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Notes</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{order.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Refund Modal
export const RefundModal = ({ order, onRefund, onClose, isLoading }) => {
  const [refundAmount, setRefundAmount] = useState(order.total)
  const [reason, setReason] = useState('')
  const [restoreStock, setRestoreStock] = useState(true)

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!reason.trim()) {
      toast.error('Please provide a reason for the refund')
      return
    }

    if (refundAmount <= 0 || refundAmount > order.total) {
      toast.error('Invalid refund amount')
      return
    }

    onRefund({
      amount: refundAmount,
      reason: reason.trim(),
      restoreStock,
    })
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Process Refund</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Order Info */}
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="text-sm">
                <div className="font-medium text-gray-900">{order.orderNumber}</div>
                <div className="text-gray-600">
                  Original Amount: ${parseFloat(order.total || 0).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Refund Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Refund Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">$</span>
                <input
                  type="number"
                  min="0"
                  max={order.total}
                  step="0.01"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Refund *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter reason for refund..."
                required
              />
            </div>

            {/* Restore Stock */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="restoreStock"
                checked={restoreStock}
                onChange={(e) => setRestoreStock(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="restoreStock" className="ml-2 text-sm text-gray-700">
                Restore product stock quantities
              </label>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-sm text-yellow-800">
                <ExclamationTriangleIcon className="h-4 w-4 inline mr-1" />
                This action cannot be undone. The order will be marked as refunded.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`
                  px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
                  ${isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                  }
                `}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="small" className="mr-2" />
                    Processing...
                  </>
                ) : (
                  'Process Refund'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
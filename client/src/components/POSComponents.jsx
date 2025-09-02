import React from 'react'
import { PlusIcon, MinusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from './LoadingSpinner'

// Product Card Component - Enhanced for Cashier Use
export const ProductCard = ({ product, onAddToCart }) => {
  const isOutOfStock = product.stock <= 0
  const isLowStock = product.stock <= 10 && !isOutOfStock

  return (
    <div 
      className={`
        bg-white rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105
        ${isOutOfStock ? 'border-red-200 opacity-60' : 'border-gray-200 hover:border-primary-400'}
        min-h-[180px] flex flex-col justify-between
      `}
      onClick={() => !isOutOfStock && onAddToCart(product)}
    >
      {/* Product Image Placeholder */}
      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-md mb-3 flex items-center justify-center">
        <span className="text-3xl">📦</span>
      </div>
      
      <div className="space-y-2 flex-1">
        {/* Product Name */}
        <h3 className="font-semibold text-sm text-gray-900 leading-tight" title={product.name}>
          {product.name}
        </h3>
        
        {/* Category */}
        <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block">
          {product.category}
        </p>
        
        {/* Price and Stock */}
        <div className="space-y-1">
          <div className="text-lg font-bold text-primary-600">
            ${parseFloat(product.price || 0).toFixed(2)}
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className={`
              px-2 py-1 rounded-full font-medium
              ${isOutOfStock 
                ? 'bg-red-100 text-red-700' 
                : isLowStock 
                  ? 'bg-orange-100 text-orange-700' 
                  : 'bg-green-100 text-green-700'
              }
            `}>
              {isOutOfStock ? 'Out of Stock' : `${product.stock} in stock`}
            </span>
          </div>
        </div>
        
        {/* Add to Cart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onAddToCart(product)
          }}
          disabled={isOutOfStock}
          className={`
            w-full py-3 px-3 rounded-md text-sm font-semibold transition-all duration-200
            ${isOutOfStock
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 active:bg-primary-800'
            }
          `}
        >
          <PlusIcon className="h-4 w-4 inline mr-1" />
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}

// Cart Item Component - Enhanced for Cashier Use
export const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const { product, quantity } = item
  const productPrice = parseFloat(product.price || 0)
  const itemTotal = productPrice * quantity

  return (
    <div className="flex items-center space-x-3 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-md flex items-center justify-center">
        <span className="text-lg">📦</span>
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-900 truncate">{product.name}</h4>
        <p className="text-xs text-gray-500">${productPrice.toFixed(2)} each</p>
        <p className="text-sm font-bold text-primary-600">${itemTotal.toFixed(2)}</p>
      </div>
      
      <div className="flex items-center space-x-1">
        <button
          onClick={() => onUpdateQuantity(product._id, quantity - 1)}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md focus:outline-none transition-colors"
        >
          <MinusIcon className="h-4 w-4" />
        </button>
        
        <span className="w-10 text-center text-sm font-semibold bg-gray-50 py-1 rounded">{quantity}</span>
        
        <button
          onClick={() => onUpdateQuantity(product._id, quantity + 1)}
          disabled={quantity >= product.stock}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => onRemove(product._id)}
          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md focus:outline-none ml-2 transition-colors"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// Cart Summary Component
export const CartSummary = ({ 
  subtotal, 
  discount, 
  tax, 
  total, 
  onDiscountChange, 
  onTaxChange 
}) => {
  const discountAmount = discount.type === 'percentage' 
    ? (subtotal * discount.value / 100) 
    : Math.min(discount.value, subtotal)
  const afterDiscount = subtotal - discountAmount
  const taxAmount = afterDiscount * (tax.percentage / 100)

  return (
    <div className="p-4 space-y-3">
      {/* Subtotal */}
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Subtotal</span>
        <span className="font-medium">${subtotal.toFixed(2)}</span>
      </div>
      
      {/* Discount */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-600">Discount</label>
          <div className="flex items-center space-x-2">
            <select
              value={discount.type}
              onChange={(e) => onDiscountChange({ ...discount, type: e.target.value })}
              className="text-xs border border-gray-300 rounded px-2 py-1"
            >
              <option value="percentage">%</option>
              <option value="fixed">$</option>
            </select>
            <input
              type="number"
              min="0"
              max={discount.type === 'percentage' ? 100 : subtotal}
              value={discount.value}
              onChange={(e) => onDiscountChange({ ...discount, value: parseFloat(e.target.value) || 0 })}
              className="w-16 text-xs border border-gray-300 rounded px-2 py-1 text-right"
              placeholder="0"
            />
          </div>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount Applied</span>
            <span>-${discountAmount.toFixed(2)}</span>
          </div>
        )}
      </div>
      
      {/* Tax */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-600">Tax (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={tax.percentage}
            onChange={(e) => onTaxChange({ percentage: parseFloat(e.target.value) || 0 })}
            className="w-16 text-xs border border-gray-300 rounded px-2 py-1 text-right"
            placeholder="0"
          />
        </div>
        {taxAmount > 0 && (
          <div className="flex justify-between text-sm text-blue-600">
            <span>Tax Applied</span>
            <span>+${taxAmount.toFixed(2)}</span>
          </div>
        )}
      </div>
      
      <div className="border-t pt-3">
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span className="text-primary-600">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}

// Checkout Modal Component
export const CheckoutModal = ({
  cart,
  customer,
  paymentMethod,
  paymentMethods,
  subtotal,
  discount,
  tax,
  total,
  onCustomerChange,
  onPaymentMethodChange,
  onProcessOrder,
  onClose,
  isLoading,
}) => {
  const discountAmount = discount.type === 'percentage' 
    ? (subtotal * discount.value / 100) 
    : Math.min(discount.value, subtotal)
  const taxAmount = (subtotal - discountAmount) * (tax.percentage / 100)

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Checkout</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Order Summary */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Order Summary</h4>
              <div className="bg-gray-50 rounded-md p-4 max-h-40 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.product._id} className="flex justify-between items-center py-2">\n                    <div className="flex-1">
                      <span className="text-sm font-medium">{item.product.name}</span>
                      <span className="text-xs text-gray-500 ml-2">x{item.quantity}</span>
                    </div>
                    <span className="text-sm font-medium">
                      ${(parseFloat(item.product.price || 0) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Information */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Customer Information (Optional)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={customer.name}
                  onChange={(e) => onCustomerChange({ ...customer, name: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={customer.email}
                  onChange={(e) => onCustomerChange({ ...customer, email: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={customer.phone}
                  onChange={(e) => onCustomerChange({ ...customer, phone: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Payment Method</h4>
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.value}
                    onClick={() => onPaymentMethodChange(method.value)}
                    className={`
                      flex items-center justify-center p-3 border-2 rounded-md transition-colors
                      ${paymentMethod === method.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <method.icon className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-gray-50 rounded-md p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Payment Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {taxAmount > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Tax ({tax.percentage}%)</span>
                    <span>+${taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              onClick={onProcessOrder}
              disabled={isLoading}
              className={`
                px-6 py-2 text-sm font-medium text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                ${isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700'
                }
              `}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="small" className="mr-2" />
                  Processing...
                </>
              ) : (
                `Complete Order - $${total.toFixed(2)}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
import React from 'react'
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from './LoadingSpinner'

const ProductModal = ({
  type,
  product,
  onClose,
  onSubmit,
  register,
  errors,
  categories,
  isLoading,
}) => {
  const modalTitles = {
    create: 'Add New Product',
    edit: 'Edit Product',
    view: 'Product Details',
    delete: 'Delete Product',
  }

  const isReadOnly = type === 'view'

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {modalTitles[type]}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {type === 'delete' ? (
              <DeleteConfirmation
                product={product}
                onConfirm={onSubmit}
                onCancel={onClose}
                isLoading={isLoading}
              />
            ) : (
              <ProductForm
                type={type}
                product={product}
                onSubmit={onSubmit}
                register={register}
                errors={errors}
                categories={categories}
                isReadOnly={isReadOnly}
                isLoading={isLoading}
                onCancel={onClose}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const ProductForm = ({
  type,
  product,
  onSubmit,
  register,
  errors,
  categories,
  isReadOnly,
  isLoading,
  onCancel,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name *
          </label>
          <input
            {...register('name', {
              required: 'Product name is required',
              maxLength: {
                value: 100,
                message: 'Name cannot exceed 100 characters',
              },
            })}
            type="text"
            disabled={isReadOnly}
            className={`
              w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm
              ${errors.name ? 'border-red-300' : 'border-gray-300'}
              ${isReadOnly ? 'bg-gray-50 text-gray-500' : ''}
            `}
            placeholder="Enter product name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price ($) *
          </label>
          <input
            {...register('price', {
              required: 'Price is required',
              min: {
                value: 0,
                message: 'Price must be positive',
              },
            })}
            type="number"
            step="0.01"
            disabled={isReadOnly}
            className={`
              w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm
              ${errors.price ? 'border-red-300' : 'border-gray-300'}
              ${isReadOnly ? 'bg-gray-50 text-gray-500' : ''}
            `}
            placeholder="0.00"
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
          )}
        </div>

        {/* Cost */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cost ($)
          </label>
          <input
            {...register('cost', {
              min: {
                value: 0,
                message: 'Cost must be positive',
              },
            })}
            type="number"
            step="0.01"
            disabled={isReadOnly}
            className={`
              w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm
              ${errors.cost ? 'border-red-300' : 'border-gray-300'}
              ${isReadOnly ? 'bg-gray-50 text-gray-500' : ''}
            `}
            placeholder="0.00"
          />
          {errors.cost && (
            <p className="mt-1 text-sm text-red-600">{errors.cost.message}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            {...register('category', {
              required: 'Category is required',
            })}
            disabled={isReadOnly}
            className={`
              w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm
              ${errors.category ? 'border-red-300' : 'border-gray-300'}
              ${isReadOnly ? 'bg-gray-50 text-gray-500' : ''}
            `}
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}\n          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        {/* Stock */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stock Quantity *
          </label>
          <input
            {...register('stock', {
              required: 'Stock quantity is required',
              min: {
                value: 0,
                message: 'Stock cannot be negative',
              },
            })}
            type="number"
            disabled={isReadOnly}
            className={`
              w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm
              ${errors.stock ? 'border-red-300' : 'border-gray-300'}
              ${isReadOnly ? 'bg-gray-50 text-gray-500' : ''}
            `}
            placeholder="0"
          />
          {errors.stock && (
            <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
          )}
        </div>

        {/* SKU */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SKU
          </label>
          <input
            {...register('sku')}
            type="text"
            disabled={isReadOnly}
            className={`
              w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm
              ${isReadOnly ? 'bg-gray-50 text-gray-500' : 'border-gray-300'}
            `}
            placeholder="Product SKU"
          />
        </div>

        {/* Barcode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Barcode
          </label>
          <input
            {...register('barcode')}
            type="text"
            disabled={isReadOnly}
            className={`
              w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm
              ${isReadOnly ? 'bg-gray-50 text-gray-500' : 'border-gray-300'}
            `}
            placeholder="Product barcode"
          />
        </div>

        {/* Min Stock */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Stock
          </label>
          <input
            {...register('minStock', {
              min: {
                value: 0,
                message: 'Minimum stock cannot be negative',
              },
            })}
            type="number"
            disabled={isReadOnly}
            className={`
              w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm
              ${errors.minStock ? 'border-red-300' : 'border-gray-300'}
              ${isReadOnly ? 'bg-gray-50 text-gray-500' : ''}
            `}
            placeholder="5"
          />
          {errors.minStock && (
            <p className="mt-1 text-sm text-red-600">{errors.minStock.message}</p>
          )}
        </div>

        {/* Unit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit
          </label>
          <input
            {...register('unit')}
            type="text"
            disabled={isReadOnly}
            className={`
              w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm
              ${isReadOnly ? 'bg-gray-50 text-gray-500' : 'border-gray-300'}
            `}
            placeholder="piece, kg, liter, etc."
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          {...register('description', {
            maxLength: {
              value: 500,
              message: 'Description cannot exceed 500 characters',
            },
          })}
          rows={3}
          disabled={isReadOnly}
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm
            ${errors.description ? 'border-red-300' : 'border-gray-300'}
            ${isReadOnly ? 'bg-gray-50 text-gray-500' : ''}
          `}
          placeholder="Product description (optional)"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Active Status */}
      {!isReadOnly && (
        <div className="flex items-center">
          <input
            {...register('isActive')}
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            defaultChecked={true}
          />
          <label className="ml-2 text-sm text-gray-700">
            Active (product will be available for sale)
          </label>
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Cancel
        </button>
        {!isReadOnly && (
          <button
            type="submit"
            disabled={isLoading}
            className={`
              px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
              ${isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700'
              }
            `}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="small" className="mr-2" />
                {type === 'create' ? 'Creating...' : 'Updating...'}
              </>
            ) : (
              type === 'create' ? 'Create Product' : 'Update Product'
            )}
          </button>
        )}
      </div>
    </form>
  )
}

const DeleteConfirmation = ({ product, onConfirm, onCancel, isLoading }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">Delete Product</h3>
          <p className="text-sm text-gray-500">
            This action cannot be undone. This will permanently delete the product.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-md">
        <h4 className="font-medium text-gray-900">{product?.name}</h4>
        <p className="text-sm text-gray-600">
          Category: {product?.category} | Price: ${product?.price?.toFixed(2)}
        </p>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
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
              Deleting...
            </>
          ) : (
            'Delete Product'
          )}
        </button>
      </div>
    </div>
  )
}

export default ProductModal
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { productsAPI, handleAPIError } from '../utils/api'
import LoadingSpinner from '../components/LoadingSpinner'
import ProductModal from '../components/ProductModal'
import toast from 'react-hot-toast'

const Products = () => {
  const queryClient = useQueryClient()
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('create') // create, edit, view, delete
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    isActive: 'true',
    lowStock: false,
  })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Fetch products
  const {
    data: productsData,
    isLoading,
    error,
  } = useQuery(
    ['products', currentPage, filters],
    () =>
      productsAPI.getProducts({
        page: currentPage,
        limit: itemsPerPage,
        ...filters,
      }),
    {
      select: (response) => response.data.data,
      keepPreviousData: true,
    }
  )

  // Fetch categories
  const { data: categoriesData } = useQuery(
    ['categories'],
    () => productsAPI.getCategories(),
    {
      select: (response) => response.data.data.categories,
    }
  )

  // Create product mutation
  const createProductMutation = useMutation(
    (productData) => productsAPI.createProduct(productData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['products'])
        toast.success('Product created successfully')
        setShowModal(false)
        reset()
      },
      onError: (error) => {
        toast.error(handleAPIError(error))
      },
    }
  )

  // Update product mutation
  const updateProductMutation = useMutation(
    ({ id, data }) => productsAPI.updateProduct(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['products'])
        toast.success('Product updated successfully')
        setShowModal(false)
        setSelectedProduct(null)
        reset()
      },
      onError: (error) => {
        toast.error(handleAPIError(error))
      },
    }
  )

  // Delete product mutation
  const deleteProductMutation = useMutation(
    (id) => productsAPI.deleteProduct(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['products'])
        toast.success('Product deleted successfully')
        setShowModal(false)
        setSelectedProduct(null)
      },
      onError: (error) => {
        toast.error(handleAPIError(error))
      },
    }
  )

  // Form handling
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm()

  const onSubmit = (data) => {
    if (modalType === 'create') {
      createProductMutation.mutate(data)
    } else if (modalType === 'edit') {
      updateProductMutation.mutate({ id: selectedProduct._id, data })
    }
  }

  const openModal = (type, product = null) => {
    setModalType(type)
    setSelectedProduct(product)
    setShowModal(true)

    if (type === 'edit' && product) {
      // Populate form with product data
      Object.keys(product).forEach((key) => {
        setValue(key, product[key])
      })
    } else {
      reset()
    }
  }

  const handleDelete = () => {
    if (selectedProduct) {
      deleteProductMutation.mutate(selectedProduct._id)
    }
  }

  const categories = categoriesData && categoriesData.length > 0 ? categoriesData : [
    'Electronics',
    'Clothing',
    'Food & Beverage',
    'Books',
    'Health & Beauty',
    'Home & Garden',
    'Sports',
    'Toys',
    'Automotive',
    'Other',
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-red-600 text-lg">Error loading products</p>
        <p className="text-gray-500">{error.message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Reload Page
        </button>
      </div>
    )
  }

  // Debug logging
  console.log('Products Data:', productsData)
  console.log('Categories Data:', categoriesData)

  return (
    <div className="space-y-6">
      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 p-2 text-xs text-gray-600 rounded">
          Debug: Products loaded: {productsData?.products?.length || 0} | 
          Categories: {categoriesData?.length || 0} | 
          Loading: {isLoading ? 'Yes' : 'No'}
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your inventory and product catalog</p>
        </div>
        <button
          onClick={() => openModal('create')}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <select
            value={filters.category}
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            value={filters.isActive}
            onChange={(e) =>
              setFilters({ ...filters, isActive: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="lowStock"
              checked={filters.lowStock}
              onChange={(e) =>
                setFilters({ ...filters, lowStock: e.target.checked })
              }
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="lowStock" className="ml-2 text-sm text-gray-700">
              Low Stock Only
            </label>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productsData?.products?.length > 0 ? (
                productsData.products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.sku && `SKU: ${product.sku}`}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${parseFloat(product.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span
                          className={`text-sm ${
                            product.isLowStock
                              ? 'text-red-600 font-medium'
                              : 'text-gray-900'
                          }`}
                        >
                          {product.stock}
                        </span>
                        {product.isLowStock && (
                          <ExclamationTriangleIcon className="h-4 w-4 text-red-500 ml-1" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openModal('view', product)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openModal('edit', product)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openModal('delete', product)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <PlusIcon className="h-12 w-12 text-gray-400" />
                      <p className="text-gray-500 text-lg">No products found</p>
                      <p className="text-gray-400 text-sm">Get started by adding your first product</p>
                      <button
                        onClick={() => openModal('create')}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Your First Product
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {productsData?.pagination?.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, productsData.pagination.totalProducts)}
            {' '}of {productsData.pagination.totalProducts} products
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!productsData.pagination.hasPrevPage}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm bg-primary-50 text-primary-600 border border-primary-200 rounded-md">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!productsData.pagination.hasNextPage}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <ProductModal
          type={modalType}
          product={selectedProduct}
          onClose={() => {
            setShowModal(false)
            setSelectedProduct(null)
            reset()
          }}
          onSubmit={modalType === 'delete' ? handleDelete : handleSubmit(onSubmit)}
          register={register}
          errors={errors}
          categories={categories}
          isLoading={
            createProductMutation.isLoading ||
            updateProductMutation.isLoading ||
            deleteProductMutation.isLoading
          }
        />
      )}
    </div>
  )
}

export default Products
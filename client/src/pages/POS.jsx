import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  ShoppingCartIcon,
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  BuildingLibraryIcon,
  CubeIcon,
} from '@heroicons/react/24/outline'
import { productsAPI, ordersAPI, handleAPIError } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { ProductCard, CartItem, CartSummary, CheckoutModal } from '../components/POSComponents'
import CashierWelcome from '../components/CashierWelcome'
import toast from 'react-hot-toast'

const POS = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [cart, setCart] = useState([])
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' })
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [discount, setDiscount] = useState({ type: 'percentage', value: 0 })
  const [tax, setTax] = useState({ percentage: 0 })
  const [showCheckout, setShowCheckout] = useState(false)

  // Fetch products for POS
  const {
    data: productsData,
    isLoading: productsLoading,
  } = useQuery(
    ['pos-products', searchTerm, selectedCategory],
    () =>
      productsAPI.getProducts({
        search: searchTerm,
        category: selectedCategory,
        isActive: 'true',
        limit: 50,
      }),
    {
      select: (response) => response.data.data.products,
    }
  )

  // Fetch categories
  const { data: categories } = useQuery(
    ['categories'],
    () => productsAPI.getCategories(),
    {
      select: (response) => response.data.data.categories,
    }
  )

  // Create order mutation
  const createOrderMutation = useMutation(
    (orderData) => ordersAPI.createOrder(orderData),
    {
      onSuccess: (response) => {
        const order = response.data.data.order
        toast.success(`Order ${order.orderNumber} created successfully!`)
        setCart([])
        setCustomer({ name: '', email: '', phone: '' })
        setDiscount({ type: 'percentage', value: 0 })
        setTax({ percentage: 0 })
        setShowCheckout(false)
        queryClient.invalidateQueries(['orders'])
        queryClient.invalidateQueries(['orderStats'])
        // Show receipt
        showReceipt(order)
      },
      onError: (error) => {
        toast.error(handleAPIError(error))
      },
    }
  )

  // Add product to cart
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.product._id === product._id)
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error('Not enough stock available')
        return
      }
      setCart(cart.map(item => 
        item.product._id === product._id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      if (product.stock <= 0) {
        toast.error('Product is out of stock')
        return
      }
      setCart([...cart, { product, quantity: 1 }])
    }
  }

  // Update cart item quantity
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    const cartItem = cart.find(item => item.product._id === productId)
    if (newQuantity > cartItem.product.stock) {
      toast.error('Not enough stock available')
      return
    }

    setCart(cart.map(item => 
      item.product._id === productId 
        ? { ...item, quantity: newQuantity }
        : item
    ))
  }

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product._id !== productId))
  }

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.product.price || 0) * item.quantity), 0)
  const discountAmount = discount.type === 'percentage' 
    ? (subtotal * discount.value / 100) 
    : Math.min(discount.value, subtotal)
  const afterDiscount = subtotal - discountAmount
  const taxAmount = afterDiscount * (tax.percentage / 100)
  const total = afterDiscount + taxAmount

  // Handle checkout
  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty')
      return
    }
    setShowCheckout(true)
  }

  // Process order
  const processOrder = () => {
    const orderData = {
      items: cart.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
      })),
      paymentMethod,
      customer: customer.name || customer.email || customer.phone ? customer : undefined,
      discount: discount.value > 0 ? {
        type: discount.type,
        percentage: discount.type === 'percentage' ? discount.value : 0,
        amount: discount.type === 'fixed' ? discount.value : 0,
      } : undefined,
      tax: tax.percentage > 0 ? { percentage: tax.percentage } : undefined,
    }

    createOrderMutation.mutate(orderData)
  }

  // Show receipt (placeholder - could be modal or print)
  const showReceipt = (order) => {
    console.log('Receipt data:', order)
    // Here you would typically show a receipt modal or trigger printing
  }

  const paymentMethods = [
    { value: 'cash', label: 'Cash', icon: BanknotesIcon },
    { value: 'card', label: 'Card', icon: CreditCardIcon },
    { value: 'digital_wallet', label: 'Digital Wallet', icon: DevicePhoneMobileIcon },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: BuildingLibraryIcon },
  ]

  return (
    <div className="h-screen flex">
      {/* Left Panel - Products */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Point of Sale</h1>
              <p className="text-sm text-gray-600 mt-1">Select products to add to customer's order</p>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-500">Cashier: {user?.name}</p>
              <p className="text-xs text-gray-400">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
          
          {/* Search and Filters */}
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 min-w-[140px] text-sm"
            >
              <option value="">All Categories</option>
              {categories?.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {/* Cashier Welcome Message - Show only if user is cashier */}
          {user?.role === 'cashier' && (
            <div className="mb-6">
              <CashierWelcome user={user} />
            </div>
          )}
          
          {productsLoading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="large" />
            </div>
          ) : productsData?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <CubeIcon className="h-16 w-16 mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No Products Found</h3>
              <p className="text-sm text-center">
                {searchTerm || selectedCategory 
                  ? 'Try adjusting your search or category filter' 
                  : 'No products available. Please contact your administrator.'}
              </p>
            </div>
          ) : (
            <div>
              {/* Products found indicator */}
              <div className="mb-4 text-sm text-gray-600">
                Found {productsData.length} {productsData.length === 1 ? 'product' : 'products'}
                {searchTerm && ` for "${searchTerm}"`}
                {selectedCategory && ` in ${selectedCategory}`}
              </div>
              
              {/* Enhanced grid for cashier use */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                {productsData.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onAddToCart={addToCart}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Cart */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col shadow-lg">
        {/* Cart Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Customer Order</h2>
            <div className="flex items-center text-sm text-gray-500 bg-white px-3 py-1 rounded-full">
              <ShoppingCartIcon className="h-4 w-4 mr-1" />
              {cart.length} {cart.length === 1 ? 'item' : 'items'}
            </div>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
              <ShoppingCartIcon className="h-16 w-16 mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Empty Cart</h3>
              <p className="text-sm text-center">Click on products to add them to the customer's order</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {cart.map((item) => (
                <CartItem
                  key={item.product._id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                />
              ))}
            </div>
          )}
        </div>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50">
            <CartSummary
              subtotal={subtotal}
              discount={discount}
              tax={tax}
              total={total}
              onDiscountChange={setDiscount}
              onTaxChange={setTax}
            />
            
            <div className="p-4 bg-white">
              <button
                onClick={handleCheckout}
                className="w-full bg-primary-600 text-white py-4 px-4 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 font-semibold text-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Process Payment (${total.toFixed(2)})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          cart={cart}
          customer={customer}
          paymentMethod={paymentMethod}
          paymentMethods={paymentMethods}
          subtotal={subtotal}
          discount={discount}
          tax={tax}
          total={total}
          onCustomerChange={setCustomer}
          onPaymentMethodChange={setPaymentMethod}
          onProcessOrder={processOrder}
          onClose={() => setShowCheckout(false)}
          isLoading={createOrderMutation.isLoading}
        />
      )}
    </div>
  )
}

export default POS
import React from 'react'
import { ShoppingCartIcon, CubeIcon, UserIcon } from '@heroicons/react/24/outline'

const CashierWelcome = ({ user }) => {
  return (
    <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-4 mb-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-white bg-opacity-20 p-2 rounded-full">
            <UserIcon className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Welcome, {user?.name}!</h2>
            <p className="text-primary-100 text-sm">You're now in the POS system - ready to take customer orders</p>
          </div>
        </div>
        
        <div className="flex space-x-6 text-center">
          <div className="bg-white bg-opacity-10 p-3 rounded-lg">
            <CubeIcon className="h-6 w-6 mx-auto mb-1" />
            <p className="text-xs">Browse Products</p>
          </div>
          <div className="bg-white bg-opacity-10 p-3 rounded-lg">
            <ShoppingCartIcon className="h-6 w-6 mx-auto mb-1" />
            <p className="text-xs">Add to Cart</p>
          </div>
        </div>
      </div>
      
      <div className="mt-3 text-sm text-primary-100">
        <p>👈 Click on products to add them to the customer's order | Use search and filters to find items quickly</p>
      </div>
    </div>
  )
}

export default CashierWelcome
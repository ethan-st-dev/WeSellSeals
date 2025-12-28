import type { Route } from "./+types/cart";
import React from "react";
import { Link } from "react-router";
import { useCart } from "../context/CartContext";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Shopping Cart — We Sell Seals" }];
}

export default function Cart() {
  const { state, removeItem, updateQuantity, clearCart } = useCart();

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  if (state.items.length === 0) {
    return (
      <main className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Shopping Cart
        </h1>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 6m12-6l2 6m-10 0a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z"
            />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Add some seals to get started!
          </p>
          <Link
            to="/seals"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-colors"
          >
            Browse Seals
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Shopping Cart
        </h1>
        {state.items.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="text-sm text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300"
          >
            Clear Cart
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {state.items.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex gap-4">
                {/* Image */}
                <div className="flex-shrink-0 w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
                  {item.imageSrc && (
                    <img
                      src={item.imageSrc}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Details */}
                <div className="flex-grow">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        <Link
                          to={`/seals/${item.id}`}
                          className="hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                          {item.title}
                        </Link>
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      aria-label="Remove item"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 mt-3">
                    <label htmlFor={`quantity-${item.id}`} className="text-sm text-gray-600 dark:text-gray-400">
                      Quantity:
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center"
                        aria-label="Decrease quantity"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      <input
                        type="number"
                        id={`quantity-${item.id}`}
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                        className="w-16 text-center border border-gray-300 dark:border-gray-600 rounded-md py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center"
                        aria-label="Increase quantity"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                    <span className="ml-auto font-semibold text-gray-900 dark:text-gray-100">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="text-gray-900 dark:text-gray-100">
                  ${state.totalPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Items ({state.totalItems})
                </span>
                <span className="text-gray-900 dark:text-gray-100">
                  {state.totalItems} {state.totalItems === 1 ? 'item' : 'items'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {state.totalPrice > 50 ? 'FREE' : '$5.99'}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mb-6">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900 dark:text-gray-100">Total</span>
                <span className="font-semibold text-xl text-indigo-600 dark:text-indigo-400">
                  ${(state.totalPrice + (state.totalPrice > 50 ? 0 : 5.99)).toFixed(2)}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-colors font-semibold"
            >
              Proceed to Checkout
            </button>

            <Link
              to="/seals"
              className="block w-full text-center py-2 mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
            >
              Continue Shopping
            </Link>

            {state.totalPrice < 50 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                Add ${(50 - state.totalPrice).toFixed(2)} more for free shipping!
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}


import type { Route } from "./+types/checkout";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import CheckoutForm from "../components/CheckoutForm";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Checkout — We Sell Seals" }];
}

// Replace with your actual publishable key from .env
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_YOUR_PUBLISHABLE_KEY_HERE");

export default function Checkout() {
  const { state, clearCart } = useCart();
  const { user, getToken } = useAuth();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login?redirect=/checkout");
      return;
    }

    if (state.items.length === 0) {
      navigate("/cart");
      return;
    }

    // Create payment intent
    const createPaymentIntent = async () => {
      try {
        const token = await getToken();
        if (!token) {
          setError("Authentication required. Please log in again.");
          setLoading(false);
          return;
        }

        const response = await fetch("http://localhost:5159/api/payments/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: state.items.map(item => ({
              sealId: item.id,
              title: item.title,
              price: item.price,
            })),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setClientSecret(data.clientSecret);
        } else {
          const data = await response.json();
          setError(data.message || data.title || data.detail || "Failed to initialize payment");
          console.error("Payment intent error:", data);
        }
      } catch (err) {
        setError("Unable to connect to payment server. Please try again.");
        console.error("Payment intent error:", err);
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [user, state.items, navigate, getToken]);

  const appearance = {
    theme: 'stripe' as const,
  };

  const options = {
    clientSecret,
    appearance,
  };

  if (loading) {
    return (
      <main className="max-w-screen-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Preparing checkout...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-screen-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
            Checkout Error
          </h2>
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => navigate("/cart")}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
          >
            Return to Cart
          </button>
        </div>
      </main>
    );
  }

  if (!clientSecret) {
    return (
      <main className="max-w-screen-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Unable to initialize checkout. Please try again.</p>
          <button
            onClick={() => navigate("/cart")}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
          >
            Return to Cart
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-screen-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
        Complete Your Purchase
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Order Summary
            </h2>
            <div className="space-y-3 mb-4">
              {state.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{item.title}</span>
                  <span className="text-gray-900 dark:text-gray-100">
                    ${item.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900 dark:text-gray-100">Total</span>
                <span className="font-semibold text-xl text-indigo-600 dark:text-indigo-400">
                  ${state.totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Payment Information
            </h2>
            {clientSecret && (
              <Elements options={options} stripe={stripePromise}>
                <CheckoutForm onSuccess={() => {
                  clearCart();
                  navigate("/user?success=true");
                }} />
              </Elements>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

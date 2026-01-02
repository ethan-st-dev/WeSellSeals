import React from "react";
import { Outlet } from "react-router";
import { useCart } from "../context/CartContext";

export function meta() {
  return [
    { title: "Seals — We Sell Seals" },
    { name: "description", content: "Browse our seal models" },
  ];
}

export default function SealsLayout() {
  const { state } = useCart();

  return (
    <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">All Seals</h1>
        <div className="text-sm text-gray-700 dark:text-gray-300">Cart: {state.totalItems} items</div>
      </div>

      <Outlet />
    </main>
  );
}

import React from "react";
import { Link } from "react-router";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { state } = useCart();
  const { user, loading } = useAuth();

  return (
    <header className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="inline-flex items-center gap-3"
            aria-label="WeSellSeals home"
          >
            {/* Use the provided seal image placed in public/seal-logo2.png */}
            <img
              src="/seal-logo2.png"
              className="h-20 w-20 object-contain bg-transparent"
              alt="WeSellSeals logo"
            />

            {/* Replace the simple text with a compact SVG wordmark for a more professional, logo-like appearance. */}
            <div className="flex flex-col leading-tight">
              <span className="sr-only">WeSellSeals</span>

              {/* Inline SVG wordmark - uses the same gradient as tailwind classes for consistency */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 300 48"
                className="h-6 sm:h-8 w-auto"
                role="img"
                aria-labelledby="wsLogoTitle wsLogoDesc"
              >
                <title id="wsLogoTitle">WeSellSeals</title>
                <desc id="wsLogoDesc">WeSellSeals wordmark with gradient</desc>
                <defs>
                  <linearGradient id="wsGradient" x1="0%" x2="100%">
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="50%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#EC4899" />
                  </linearGradient>
                </defs>
                {/* Use <text> so the text scales crisply */}
                <text
                  x="0"
                  y="34"
                  fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial"
                  fontWeight="800"
                  fontSize="28"
                  letterSpacing="-0.02em"
                  fill="url(#wsGradient)"
                >
                  WeSellSeals
                </text>
              </svg>

              <span className="text-xs text-gray-500 dark:text-gray-400 -mt-0.5">
                Quality seals &amp; supplies
              </span>
            </div>
          </a>
        </div>

        <div className="flex items-center gap-4">
          {loading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : user ? (
            <Link
              to="/user"
              className="text-sm font-medium px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md hover:from-indigo-700 hover:to-purple-700 transition"
            >
              {user.email}
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="text-sm font-medium px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Sign Up
              </Link>
            </>
          )}
          <Link
            to="/cart"
            aria-label="Open cart"
            className="relative p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="w-6 h-6"
              aria-hidden="true"
            >
              <path
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 6m12-6l2 6m-10 0a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z"
              />
            </svg>
            <span className="sr-only">Cart</span>
            {state.totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                {state.totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

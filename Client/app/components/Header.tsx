import React from "react";
import logoLight from "../welcome/logo-light.svg";
import logoDark from "../welcome/logo-dark.svg";

export default function Header() {
  return (
    <header className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/" className="inline-flex items-center">
            <img
              src={logoLight}
              className="h-8 block dark:hidden"
              alt="We Sell Seals logo"
            />
            <img
              src={logoDark}
              className="h-8 hidden dark:block"
              alt="We Sell Seals logo (dark)"
            />
            <span className="sr-only">We Sell Seals</span>
          </a>
        </div>

        <div className="flex items-center">
          <button
            type="button"
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
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
              0
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}


import React from "react";

export default function Footer(): React.ReactElement {
  return (
    <footer className="bg-gray-900 text-gray-200 py-8 mt-12">
      <div className="container mx-auto px-4 grid sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <h4 className="font-semibold mb-2">Company</h4>
          <ul className="text-sm space-y-1">
            <li>
              <a href="#" className="hover:underline">z
                About Us
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Careers
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Press
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Shop</h4>
          <ul className="text-sm space-y-1">
            <li>
              <a href="#" className="hover:underline">
                All Seals
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                New Arrivals
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Best Sellers
              </a>
            </li>
          </ul>
        </div>

        <nav aria-label="footer-support">
          <h4 className="font-semibold mb-2">Support</h4>
          <ul className="text-sm space-y-1">
            <li>
              <a href="#" className="hover:underline">
                Help Center
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Shipping
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Returns
              </a>
            </li>
          </ul>
        </nav>

        <div>
          <h4 className="font-semibold mb-2">Contact</h4>
          <p className="text-sm mb-1">We Sell Seals</p>
          <p className="text-sm mb-1">123 Ocean Ave</p>
          <p className="text-sm mb-2">email@example.com</p>
          <div className="mt-3 text-xs text-gray-400">© {new Date().getFullYear()} We Sell Seals</div>
        </div>
      </div>
    </footer>
  );
}

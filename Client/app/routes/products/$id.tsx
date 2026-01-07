import type { Route } from "./+types/$id";
import { products } from "../../data/products";
import { useCart } from "../../context/CartContext";
import { useState } from "react";

export function meta({ params }: Route.MetaArgs) {
  const product = products.find((p) => p.id === params.id);
  if (!product) {
    return [{ title: "Product Not Found" }];
  }
  return [
    { title: `${product.title} — WeSellSeals` },
    { name: "description", content: product.shortDescription },
  ];
}

export default function ProductDetail({ params }: Route.ComponentProps) {
  const product = products.find((p) => p.id === params.id);
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Product Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Sorry, we couldn't find the product you're looking for.
        </p>
        <a
          href="/products"
          className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
        >
          Browse All Products
        </a>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(
      {
        id: product.id,
        title: product.title,
        price: product.price,
        imageSrc: product.image,
      },
      quantity
    );
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image Section */}
        <div className="space-y-4">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-auto object-cover"
            />
          </div>

          {/* 3D Model Viewer */}
          {product.modelUrl && (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                3D Preview
              </h3>
              <model-viewer
                src={product.modelUrl}
                alt={product.title}
                auto-rotate
                camera-controls
                style={{ width: "100%", height: "400px" }}
              ></model-viewer>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {product.title}
            </h1>
            <p className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400">
              ${product.price.toFixed(2)}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Description
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {product.longDescription || product.shortDescription}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Category
            </h2>
            <span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full text-sm">
              {product.category}
            </span>
          </div>

          {product.tags.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <div>
              <label
                htmlFor="quantity"
                className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1"
              >
                Quantity
              </label>
              <input
                type="number"
                id="quantity"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <button
              onClick={handleAddToCart}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-500 transition"
            >
              Add to Cart
            </button>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
              Product Details
            </h2>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• High-quality 3D printable model</li>
              <li>• Suitable for FDM and resin printers</li>
              <li>• Digital download - instant access</li>
              <li>• Lifetime access to files</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

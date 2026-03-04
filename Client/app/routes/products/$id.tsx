import type { Route } from "./+types/$id";
import { getProduct, type Product } from "../../data/products";
import { useCart } from "../../context/CartContext";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../lib/apiClient";
import CommentsSection from "../../components/CommentsSection";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: "Product Details — WeSellSeals" },
    { name: "description", content: "View product details" },
  ];
}

export default function ProductDetail({ params }: Route.ComponentProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { addItem, isInCart } = useCart();
  const { user, getToken } = useAuth();
  const [viewMode, setViewMode] = useState<'image' | '3d'>('3d');
  const [autoRotate, setAutoRotate] = useState(true);
  const [isOwned, setIsOwned] = useState(false);
  const [checkingOwnership, setCheckingOwnership] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProduct(params.id);
        if (data) {
          setProduct(data);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Failed to load product:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [params.id, refreshKey]);

  useEffect(() => {
    const checkOwnership = async () => {
      if (!user || !product) {
        setCheckingOwnership(false);
        return;
      }

      try {
        const token = await getToken();
        if (!token) {
          setCheckingOwnership(false);
          return;
        }

        const response = await fetch(`${API_URL}/api/purchases/check-multiple`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ sealIds: [product.id] }),
        });

        if (response.ok) {
          const data = await response.json();
          setIsOwned(data.ownedSealIds?.includes(product.id) || false);
        }
      } catch (error) {
        console.error('Error checking ownership:', error);
      } finally {
        setCheckingOwnership(false);
      }
    };

    checkOwnership();
  }, [user, product, getToken]);
  
  if (loading) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="text-gray-600 dark:text-gray-400">Loading product...</div>
      </div>
    );
  }
  
  if (notFound || !product) {
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
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      imageSrc: product.image,
    });
  };

  const handleDownload = async () => {
    try {
      const token = await getToken();
      if (!token) {
        alert('Please log in to download');
        return;
      }

      const response = await fetch(`${API_URL}/api/purchases/download/${product.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${product.title.replace(/\s+/g, '-')}.glb`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download file. Please try again.');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  const inCart = isInCart(product.id);

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image/Model Section */}
        <div className="space-y-4">
          {/* View Toggle */}
          <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('image')}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition ${
                viewMode === 'image'
                  ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              Image
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition ${
                viewMode === '3d'
                  ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              3D Model
            </button>
          </div>

          {/* Content Area */}
          {viewMode === 'image' ? (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-auto object-cover"
              />
            </div>
          ) : (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  3D Preview
                </h3>
                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  className="text-xs px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800 transition"
                >
                  {autoRotate ? '⏸ Pause' : '▶ Rotate'}
                </button>
              </div>
              {product.modelUrl ? (
                <model-viewer
                  src={product.modelUrl}
                  alt={product.title}
                  auto-rotate={autoRotate}
                  camera-controls
                  interaction-prompt={autoRotate ? "none" : "auto"}
                  loading="eager"
                  reveal="auto"
                  style={{ width: "100%", height: "400px", backgroundColor: "#f0f0f0", display: "block" }}
                  onError={(e: any) => console.error('Model viewer error:', e)}
                  onLoad={() => console.log('Model loaded successfully from:', product.modelUrl)}
                ></model-viewer>
              ) : (
                <div className="flex items-center justify-center h-[400px] bg-gray-200 dark:bg-gray-700 rounded">
                  <p className="text-gray-500 dark:text-gray-400">No 3D model available</p>
                </div>
              )}
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

          <div>
            {isOwned ? (
              <button
                onClick={handleDownload}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-500 transition"
              >
                Download
              </button>
            ) : inCart ? (
              <button
                disabled
                className="w-full px-6 py-3 bg-gray-400 text-white rounded-lg font-semibold cursor-not-allowed"
              >
                In Cart
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-500 transition"
              >
                Add to Cart
              </button>
            )}
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
      <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Comments
        </h1>
        <CommentsSection
          productId={product.id}
          comments={product.comments || []}
          onCommentsChange={() => setRefreshKey(prev => prev + 1)}
        />
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../lib/apiClient";

type ProductCardProps = {
  id: string | number;
  title: string;
  price: number | string;
  imageSrc: string;
  imageAlt?: string;
};

export default function ProductCard({
  id,
  title,
  price,
  imageSrc,
  imageAlt = "Product image",
}: ProductCardProps) {
  const formattedPrice = typeof price === "number" ? `$${price.toFixed(2)}` : price;
  const numericPrice = typeof price === "number" ? price : parseFloat(price.replace(/[^0-9.]/g, ''));
  
  const { addItem, isInCart } = useCart();
  const { user, getToken } = useAuth();
  const [isOwned, setIsOwned] = useState(false);
  const [checkingOwnership, setCheckingOwnership] = useState(true);

  useEffect(() => {
    const checkOwnership = async () => {
      if (!user) {
        setCheckingOwnership(false);
        setIsOwned(false);
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
          body: JSON.stringify({ sealIds: [id.toString()] }),
        });

        if (response.ok) {
          const data = await response.json();
          setIsOwned(data.ownedSealIds?.includes(id.toString()) || false);
        }
      } catch (error) {
        console.error('Error checking ownership:', error);
      } finally {
        setCheckingOwnership(false);
      }
    };

    checkOwnership();
  }, [user, id, getToken]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: id.toString(),
      title,
      price: numericPrice,
      imageSrc,
    });
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const token = await getToken();
      if (!token) {
        alert('Please log in to download');
        return;
      }

      const response = await fetch(`${API_URL}/api/purchases/download/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/\s+/g, '-')}.glb`;
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

  const inCart = isInCart(id.toString());

  return (
    <article className="group bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
      <Link
        to={`/products/${id}`}
        aria-label={`View details for ${title}`}
        className="block"
      >
        <div className="w-full h-48 bg-gray-100 dark:bg-gray-700">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </Link>

      <div className="p-3 space-y-2">
        <Link to={`/products/${id}`}>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-2">
            {title}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            {formattedPrice}
          </p>
          
          {isOwned ? (
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-500 transition text-xs font-medium"
            >
              Download
            </button>
          ) : inCart ? (
            <button
              disabled
              className="px-3 py-1.5 bg-gray-400 text-white rounded-md cursor-not-allowed text-xs font-medium"
            >
              In Cart
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition text-xs font-medium"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

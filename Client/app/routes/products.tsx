import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router";
import type { Route } from "./+types/products";
import { getProducts, categories, type ProductCategory, type Product } from "../data/products";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../lib/apiClient";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Browse 3D Models — WeSellSeals" },
    { name: "description", content: "Browse our collection of 3D printable models" },
  ];
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { addItem, isInCart } = useCart();
  const { user, getToken } = useAuth();
  const [ownedProducts, setOwnedProducts] = useState<Set<string>>(new Set());
  
  const categoryParam = searchParams.get("category") as ProductCategory | null;
  const searchParam = searchParams.get("search") || "";
  
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "all">(
    categoryParam || "all"
  );
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [sortBy, setSortBy] = useState<"name" | "price-low" | "price-high">("name");
  
  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Sync state with URL parameters when they change
  useEffect(() => {
    setSelectedCategory(categoryParam || "all");
    setSearchQuery(searchParam);
  }, [categoryParam, searchParam]);

  // Check which products the user owns
  useEffect(() => {
    const checkOwnership = async () => {
      if (!user) {
        setOwnedProducts(new Set());
        return;
      }

      if (!products.length) return;

      try {
        const token = await getToken();
        if (!token) return;

        const sealIds = products.map(p => p.id);
        const response = await fetch(`${API_URL}/api/purchases/check-multiple`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ sealIds }),
        });

        if (response.ok) {
          const data = await response.json();
          setOwnedProducts(new Set(data.ownedSealIds || []));
        }
      } catch (error) {
        console.error('Error checking ownership:', error);
      }
    };

    checkOwnership();
  }, [user, getToken, products]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = products.filter(p => p.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) => {
          const tags = Array.isArray(product.tags) ? product.tags : [];
          return (
            product.title.toLowerCase().includes(query) ||
            product.shortDescription.toLowerCase().includes(query) ||
            tags.some((tag) => tag.toLowerCase().includes(query)) ||
            (product.subcategory && product.subcategory.toLowerCase().includes(query))
          );
        }
      );
    }

    // Sort
    const sorted = [...filtered];
    switch (sortBy) {
      case "price-low":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "name":
      default:
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return sorted;
  }, [products, searchQuery, selectedCategory, sortBy]);

  const categoryCount = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    products.forEach((product) => {
      counts[product.category] = (counts[product.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  const handleCategoryChange = (category: ProductCategory | "all") => {
    setSelectedCategory(category);
    if (category === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", category);
    }
    setSearchParams(searchParams);
  };

  const handleDownload = async (productId: string, productTitle: string) => {
    try {
      const token = await getToken();
      if (!token) {
        alert('Please log in to download');
        return;
      }

      const response = await fetch(`${API_URL}/api/purchases/download/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${productTitle.replace(/\s+/g, '-')}.glb`;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Browse 3D Models
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover {products.length} unique 3D printable models across {Object.keys(categories).length} categories
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <input
            type="search"
            placeholder="Search by name, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => handleCategoryChange("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === "all"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          All Products ({categoryCount.all})
        </button>
        {Object.entries(categories).map(([key, { name, icon }]) => (
          <button
            key={key}
            onClick={() => handleCategoryChange(key as ProductCategory)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
              selectedCategory === key
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            <span>{icon}</span>
            {name} ({categoryCount[key] || 0})
          </button>
        ))}
      </div>

      {/* Category Description */}
      {selectedCategory !== "all" && (
        <div className="max-w-3xl mx-auto text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
          <p className="text-gray-700 dark:text-gray-300">
            {categories[selectedCategory].description}
          </p>
        </div>
      )}

      {/* Sort and Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600 dark:text-gray-400">
          {filteredAndSortedProducts.length} model{filteredAndSortedProducts.length !== 1 ? "s" : ""} found
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm text-gray-600 dark:text-gray-400">
            Sort by:
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
          >
            <option value="name">Name</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <section aria-label="Products list">
        {filteredAndSortedProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No models found matching your criteria.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                handleCategoryChange("all");
              }}
              className="mt-4 text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAndSortedProducts.map((p) => (
              <article
                key={p.id}
                className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <Link to={`/products/${p.id}`} className="block">
                  <div className="w-full h-48 bg-gray-100 dark:bg-gray-700">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </Link>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Link to={`/products/${p.id}`} className="flex-1">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400">
                        {p.title}
                      </h2>
                    </Link>
                    <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full whitespace-nowrap flex items-center gap-1">
                      <span>{categories[p.category].icon}</span>
                      {categories[p.category].name}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-300 my-2 line-clamp-2">
                    {p.shortDescription}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {p.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="text-indigo-600 dark:text-indigo-400 font-semibold text-lg">
                      ${p.price.toFixed(2)}
                    </div>
                    {ownedProducts.has(p.id) ? (
                      <button
                        type="button"
                        onClick={() => handleDownload(p.id, p.title)}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-500 transition-colors text-sm font-medium"
                      >
                        Download
                      </button>
                    ) : isInCart(p.id) ? (
                      <button
                        type="button"
                        disabled
                        className="inline-flex items-center gap-2 px-3 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed text-sm font-medium"
                      >
                        In Cart
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          addItem({ id: p.id, title: p.title, price: p.price, imageSrc: p.image })
                        }
                        className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-colors text-sm font-medium"
                      >
                        Add to cart
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

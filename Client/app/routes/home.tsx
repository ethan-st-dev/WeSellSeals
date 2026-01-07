import type { Route } from "./+types/home";
import ProductCard from "../components/ProductCard";
import { categoryInfo, type Product } from "../data/products";
import { Link } from "react-router";
import { useState, useEffect } from "react";
import { API_URL } from "../lib/apiClient";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "WeSellSeals — 3D Models & More" },
    { name: "description", content: "Browse 3D printable models - seals, sci-fi, pirates, and more!" },
  ];
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Get featured products from each category (2 from each)
  const getProductsByCategory = (category: string) => 
    products.filter(p => p.category === category);

  const featuredSeals = getProductsByCategory("seals").slice(0, 2);
  const featuredSciFi = getProductsByCategory("sci-fi").slice(0, 2);
  const featuredPirates = getProductsByCategory("pirates").slice(0, 2);
  const featuredFantasy = getProductsByCategory("fantasy").slice(0, 2);
  const featuredVehicles = getProductsByCategory("vehicles").slice(0, 2);
  const featuredAnimals = getProductsByCategory("animals").slice(0, 2);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Hero Section */}
      <section className="relative text-center py-16 px-6 overflow-hidden rounded-3xl">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-600 dark:via-purple-600 dark:to-pink-600 opacity-90"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-blue-400 via-cyan-400 to-teal-400 dark:from-blue-500 dark:via-cyan-500 dark:to-teal-500 opacity-50 animate-pulse"></div>
        
        <div className="relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            Welcome to WeSellSeals
          </h1>
          <p className="text-xl text-white/95 mb-8 max-w-2xl mx-auto drop-shadow-md">
            Your premier destination for high-quality 3D printable models. From adorable seals to sci-fi spacecraft, we've got it all!
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/products"
              className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg transform hover:scale-105"
            >
              Browse All Models
            </Link>
            <Link
              to="/products?category=seals"
              className="px-6 py-3 bg-indigo-900/30 backdrop-blur-sm text-white border-2 border-white/50 rounded-lg font-semibold hover:bg-indigo-900/50 transition shadow-lg transform hover:scale-105"
            >
              Shop Seals 🦭
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Overview */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Explore Our Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(categoryInfo).map(([key, { name, description, icon }]) => (
            <Link
              key={key}
              to={`/products?category=${key}`}
              className="group p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/10 group-hover:to-purple-500/10 transition-all duration-300"></div>
              <div className="relative z-10">
                <div className="text-4xl mb-2 transform group-hover:scale-110 transition-transform duration-300">{icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Seals */}
      <section className="relative p-8 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-2">
            <span>🦭</span> Featured Seals
          </h2>
          <Link
            to="/products?category=seals"
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {featuredSeals.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              title={p.title}
              price={p.price}
              imageSrc={p.image}
              imageAlt={p.shortDescription}
            />
          ))}
        </div>
      </section>

      {/* Featured Sci-Fi */}
      <section className="relative p-8 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
            <span>🚀</span> Featured Sci-Fi
          </h2>
          <Link
            to="/products?category=sci-fi"
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {featuredSciFi.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              title={p.title}
              price={p.price}
              imageSrc={p.image}
              imageAlt={p.shortDescription}
            />
          ))}
        </div>
      </section>

      {/* Featured Pirates */}
      <section className="relative p-8 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent flex items-center gap-2">
            <span>🏴‍☠️</span> Featured Pirates
          </h2>
          <Link
            to="/products?category=pirates"
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {featuredPirates.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              title={p.title}
              price={p.price}
              imageSrc={p.image}
              imageAlt={p.shortDescription}
            />
          ))}
        </div>
      </section>

      {/* Featured Fantasy */}
      <section className="relative p-8 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-2">
            <span>🐉</span> Featured Fantasy
          </h2>
          <Link
            to="/products?category=fantasy"
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {featuredFantasy.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              title={p.title}
              price={p.price}
              imageSrc={p.image}
              imageAlt={p.shortDescription}
            />
          ))}
        </div>
      </section>

      {/* Browse More */}
      <section className="relative text-center py-12 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-indigo-100/50 via-purple-100/50 to-pink-100/50 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-pink-900/30"></div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Discover More Amazing Models
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Explore {products.length}+ unique 3D printable designs
          </p>
          <Link
            to="/products"
            className="inline-block px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-500 hover:to-purple-500 transition shadow-lg transform hover:scale-105"
          >
            Browse Full Catalog
          </Link>
        </div>
      </section>
    </main>
  );
}

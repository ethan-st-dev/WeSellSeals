import { useState } from "react";
import type { Route } from "./+types/admin";
import { createProduct, type ProductCategory } from "../data/products";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Admin - Add Product — WeSellSeals" },
    { name: "description", content: "Add a new product to the store" },
  ];
}

export default function AdminAddProduct() {
  const { user, getToken } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    image: "",
    shortDescription: "",
    longDescription: "",
    modelUrl: "",
    category: "seals" as ProductCategory,
    subcategory: "",
    tags: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!user) {
      setError("You must be logged in to add products");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = await getToken();
      if (!token) {
        setError("Failed to get authentication token");
        return;
      }

      // Parse tags from comma-separated string
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const newProduct = await createProduct(
        {
          title: formData.title,
          price: parseFloat(formData.price),
          image: formData.image,
          shortDescription: formData.shortDescription,
          longDescription: formData.longDescription || undefined,
          modelUrl: formData.modelUrl || undefined,
          category: formData.category,
          subcategory: formData.subcategory || undefined,
          tags: tagsArray,
        },
        token
      );

      setSuccess(true);
      
      // Reset form
      setFormData({
        title: "",
        price: "",
        image: "",
        shortDescription: "",
        longDescription: "",
        modelUrl: "",
        category: "seals",
        subcategory: "",
        tags: "",
      });

      // Redirect to the new product page after a short delay
      setTimeout(() => {
        navigate(`/products/${newProduct.id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Access Denied
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          You must be logged in to access this page.
        </p>
        <a
          href="/login"
          className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
        >
          Log In
        </a>
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
        Add New Product
      </h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200">
          Product created successfully! Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Price (USD) *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            required
            step="0.01"
            min="0"
            value={formData.price}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category *
          </label>
          <select
            id="category"
            name="category"
            required
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="seals">Seals</option>
            <option value="sci-fi">Sci-Fi</option>
            <option value="pirates">Pirates</option>
            <option value="fantasy">Fantasy</option>
            <option value="vehicles">Vehicles</option>
            <option value="architecture">Architecture</option>
            <option value="animals">Animals</option>
            <option value="characters">Characters</option>
          </select>
        </div>

        <div>
          <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Subcategory
          </label>
          <input
            type="text"
            id="subcategory"
            name="subcategory"
            value={formData.subcategory}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Image URL *
          </label>
          <input
            type="url"
            id="image"
            name="image"
            required
            value={formData.image}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="modelUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            3D Model URL (GLB)
          </label>
          <input
            type="url"
            id="modelUrl"
            name="modelUrl"
            value={formData.modelUrl}
            onChange={handleChange}
            placeholder="https://example.com/model.glb"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Short Description *
          </label>
          <textarea
            id="shortDescription"
            name="shortDescription"
            required
            rows={2}
            maxLength={500}
            value={formData.shortDescription}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="longDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Long Description
          </label>
          <textarea
            id="longDescription"
            name="longDescription"
            rows={4}
            maxLength={2000}
            value={formData.longDescription}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tags (comma-separated) *
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            required
            value={formData.tags}
            onChange={handleChange}
            placeholder="cute, small, marine, collectible"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {isSubmitting ? "Creating..." : "Create Product"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}

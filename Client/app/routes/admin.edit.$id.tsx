import { useState, useEffect } from "react";
import type { Route } from "./+types/admin.edit.$id";
import { getProduct, updateProduct, type ProductCategory, type Product } from "../data/products";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router";
import { API_URL } from "../lib/apiClient";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Admin - Edit Product — WeSellSeals" },
    { name: "description", content: "Edit product details" },
  ];
}

export default function AdminEditProduct({ params }: Route.ComponentProps) {
  const { user, getToken } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);

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

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const product = await getProduct(params.id);
      if (!product) {
        setError("Product not found");
        return;
      }

      // Convert tags array to comma-separated string
      const tagsString = Array.isArray(product.tags) 
        ? product.tags.join(", ") 
        : typeof product.tags === 'string' 
        ? product.tags 
        : "";

      setFormData({
        title: product.title,
        price: product.price.toString(),
        image: product.image,
        shortDescription: product.shortDescription,
        longDescription: product.longDescription || "",
        modelUrl: product.modelUrl || "",
        category: product.category,
        subcategory: product.subcategory || "",
        tags: tagsString,
      });
    } catch (err: any) {
      setError(err.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: "image" | "modelUrl"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFile(fieldName);
      setError(null);

      const token = await getToken();
      if (!token) {
        setError("Failed to get authentication token");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/api/admin/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Upload failed");
      }

      const data = await response.json();
      setFormData((prev) => ({ ...prev, [fieldName]: data.url }));
    } catch (err: any) {
      setError(err.message || "Failed to upload file");
    } finally {
      setUploadingFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!user) {
      setError("You must be logged in to edit products");
      return;
    }

    if (!formData.image) {
      setError("Please upload a product image");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = await getToken();
      if (!token) {
        setError("Failed to get authentication token");
        return;
      }

      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      await updateProduct(
        params.id,
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
      
      setTimeout(() => {
        navigate(`/admin`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to update product");
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

  if (loading) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading product...</p>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Error
        </h1>
        <p className="text-red-600 dark:text-red-400 mb-8">{error}</p>
        <Link
          to="/admin"
          className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
        >
          Back to Admin
        </Link>
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Edit Product
        </h1>
        <Link
          to="/admin"
          className="text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          ← Back to Products
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200">
          Product updated successfully! Redirecting...
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
            Product Image *
          </label>
          {formData.image && (
            <div className="mb-2">
              <img src={formData.image} alt="Current" className="h-32 w-32 object-cover rounded" />
              <p className="text-sm text-gray-500 mt-1">Current image (upload new to replace)</p>
            </div>
          )}
          <input
            type="file"
            id="image"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={(e) => handleFileUpload(e, "image")}
            disabled={uploadingFile === "image"}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          {uploadingFile === "image" && (
            <p className="text-sm text-indigo-600 mt-1">Uploading...</p>
          )}
        </div>

        <div>
          <label htmlFor="modelUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            3D Model (GLB)
          </label>
          {formData.modelUrl && (
            <p className="text-sm text-green-600 dark:text-green-400 mb-2">✓ Current model (upload new to replace)</p>
          )}
          <input
            type="file"
            id="modelUrl"
            accept=".glb"
            onChange={(e) => handleFileUpload(e, "modelUrl")}
            disabled={uploadingFile === "modelUrl"}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          {uploadingFile === "modelUrl" && (
            <p className="text-sm text-indigo-600 mt-1">Uploading...</p>
          )}
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
            {isSubmitting ? "Updating..." : "Update Product"}
          </button>
          <Link
            to="/admin"
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}

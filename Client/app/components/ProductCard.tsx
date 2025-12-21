import React from "react";

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

  return (
    <article className="group">
      <a
        href={`/products/${id}`}
        aria-label={`View details for ${title}`}
        className="block rounded-lg overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transform transition duration-200 ease-out motion-reduce:transition-none motion-reduce:transform-none hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <div className="w-full h-48 bg-gray-100 dark:bg-gray-700">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="p-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {title}
          </h3>
          <p className="mt-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            {formattedPrice}
          </p>
        </div>
      </a>
    </article>
  );
}

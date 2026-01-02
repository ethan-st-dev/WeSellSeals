import React from "react";
import { seals } from "../../data/seals";
import { useCart } from "../../context/CartContext";
import { Link } from "react-router";

export default function SealsIndex() {
  const { addItem } = useCart();

  return (
    <section aria-label="Seals list">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {seals.map((s) => (
          <article key={s.id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
            <Link to={`/seals/${s.id}`} className="block">
              <div className="w-full h-56 bg-gray-100 dark:bg-gray-700">
                <img src={s.image} alt={s.title} className="w-full h-full object-cover" loading="lazy" />
              </div>
            </Link>

            <div className="p-4">
              <Link to={`/seals/${s.id}`} className="inline-block mb-1">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{s.title}</h2>
              </Link>

              <p className="text-sm text-gray-600 dark:text-gray-300 my-2">{s.shortDescription}</p>

              <div className="flex items-center justify-between mt-4">
                <div className="text-indigo-600 dark:text-indigo-400 font-semibold">${s.price.toFixed(2)}</div>
                <button
                  type="button"
                  onClick={() => addItem({ id: s.id, title: s.title, price: s.price, imageSrc: s.image }, 1)}
                  className="ml-4 inline-flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
                >
                  Add to cart
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

import type { Route } from "./+types/home";
import ProductCard from "../components/ProductCard";
import { seals } from "../data/seals";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "We Sell Seals — Home" },
    { name: "description", content: "Browse 3D seal models" },
  ];
}

export default function Home() {
  return (
    <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Featured Seals
      </h1>

      <section aria-label="Product grid">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {seals.map((s) => (
            <ProductCard
              key={s.id}
              id={s.id}
              title={s.title}
              price={s.price}
              imageSrc={s.image}
              imageAlt={s.shortDescription}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

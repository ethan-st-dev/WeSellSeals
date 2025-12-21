import type { Route } from "./+types/home";
import ProductCard from "../components/ProductCard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "We Sell Seals — Home" },
    { name: "description", content: "Browse 3D seal models" },
  ];
}

const mockProducts = Array.from({ length: 12 }).map((_, i) => ({
  id: String(i + 1),
  title: `Adorable Seal Model #${i + 1}`,
  price: (9.99 + i).toFixed(2),
  imageSrc: `https://picsum.photos/seed/seal-${i + 1}/600/400`,
  imageAlt: `3D seal model ${i + 1}`,
}));

export default function Home() {
  return (
    <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Featured Seals
      </h1>

      <section aria-label="Product grid">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {mockProducts.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              title={p.title}
              price={p.price}
              imageSrc={p.imageSrc}
              imageAlt={p.imageAlt}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

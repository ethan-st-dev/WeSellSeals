import type { Route } from "./+types/$id";
import React, { useEffect } from "react";
import { useParams } from "react-router";
import { seals } from "../../data/seals";
import { useCart } from "../../context/CartContext";

export function meta({ params }: Route.MetaArgs) {
  const s = seals.find((x) => x.id === params.id);
  return [{ title: s ? `${s.title} — We Sell Seals` : "Seal not found" }];
}

function loadModelViewer() {
  if (typeof window === "undefined") return;
  if ((window as any).customElements?.get("model-viewer")) return;
  if (document.getElementById("model-viewer-script")) return;
  const script = document.createElement("script");
  script.id = "model-viewer-script";
  script.src = "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js";
  script.async = true;
  document.head.appendChild(script);
}

export default function SealDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const s = seals.find((x) => x.id === id);

  useEffect(() => {
    if (s?.modelUrl) loadModelViewer();
  }, [s?.modelUrl]);

  if (!s) {
    return (
      <main className="pt-16 p-4">
        <div className="max-w-screen-md mx-auto">Seal not found.</div>
      </main>
    );
  }

  return (
    <main className="max-w-screen-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
          {s.modelUrl ? (
            // @ts-ignore - model-viewer web component
            <model-viewer
              src={s.modelUrl}
              alt={s.title}
              camera-controls
              enable-pan
              ar
              style={{ width: "100%", height: "420px" }}
            />
          ) : (
            <img src={s.image} alt={s.title} className="w-full h-96 object-cover" />
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{s.title}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{s.longDescription ?? s.shortDescription}</p>

          <div className="mt-6 flex items-center gap-4">
            <div className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400">${s.price.toFixed(2)}</div>
            <button
              type="button"
              onClick={() => addItem({ id: s.id, title: s.title, price: s.price, imageSrc: s.image }, 1)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

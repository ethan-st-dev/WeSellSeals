import type { Route } from "./+types/$id";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { seals } from "../../data/seals";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

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
  const { addItem, isInCart } = useCart();
  const { user } = useAuth();
  const [owns, setOwns] = useState(false);
  const [checkingOwnership, setCheckingOwnership] = useState(true);
  const s = seals.find((x) => x.id === id);

  useEffect(() => {
    if (s?.modelUrl) loadModelViewer();
  }, [s?.modelUrl]);

  useEffect(() => {
    const checkOwnership = async () => {
      if (!id) return;
      
      try {
        const response = await fetch(`http://localhost:5159/api/purchases/owns/${id}`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setOwns(data.owns);
        }
      } catch (error) {
        console.error('Error checking ownership:', error);
      } finally {
        setCheckingOwnership(false);
      }
    };
    
    checkOwnership();
  }, [id, user]);

  const handleDownload = () => {
    if (!s) return;
    
    // Download the image (for now, until we have actual 3D model files)
    const link = document.createElement('a');
    link.href = s.image;
    link.download = `${s.title.replace(/\s+/g, '_')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!s) {
    return (
      <main className="pt-16 p-4">
        <div className="max-w-screen-md mx-auto">Seal not found.</div>
      </main>
    );
  }

  const inCart = isInCart(s.id);

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
            
            {checkingOwnership ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : owns ? (
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Download
              </button>
            ) : inCart ? (
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed"
              >
                In Cart
              </button>
            ) : (
              <button
                type="button"
                onClick={() => addItem({ id: s.id, title: s.title, price: s.price, imageSrc: s.image })}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
              >
                Add to cart
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

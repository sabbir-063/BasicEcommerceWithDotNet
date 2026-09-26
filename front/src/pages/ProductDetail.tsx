import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { Product } from "../utils/types";
import { money } from "../utils";
import { useAuth } from "../hooks/useAuth";

export default function ProductDetail() {
  const { slug } = useParams();
  const [p, setP] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState("");
  const nav = useNavigate();
  const { refreshCart } = useAuth();

  useEffect(() => {
    api<Product>(`/products/${slug}`)
      .then(setP)
      .catch(() => setP(null));
  }, [slug]);

  if (!p) return null; // Let the routes fall through or show not found

  const add = async () => {
    if (!sessionStorage.getItem("token")) {
      nav(`/login?returnTo=/products/${slug}`);
      return;
    }
    try {
      await api("/cart/items", {
        method: "POST",
        body: JSON.stringify({ productId: p.id, quantity: qty }),
      });
      setMsg("Added to cart");
      refreshCart();
    } catch (e) {
      setMsg((e as Error).message);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-12 bg-surface p-8 rounded border border-border shadow-sm">
      <div className="w-full md:w-1/2 aspect-w-4 aspect-h-3 bg-gray-100 flex items-center justify-center text-6xl text-gray-300 rounded overflow-hidden">
        {p.imageUrl ? (
          <img src={p.imageUrl} alt={p.imageAltText || p.name} className="object-cover w-full h-full" />
        ) : (
          <span>{p.name.slice(0, 1)}</span>
        )}
      </div>
      
      <div className="w-full md:w-1/2 flex flex-col justify-center">
        <p className="text-primary font-semibold mb-2">{p.categoryName}</p>
        <h1 className="text-4xl font-bold mb-4">{p.name}</h1>
        <p className="text-2xl font-bold mb-6 text-text">{money(p.price)}</p>
        <p className="text-text-muted leading-relaxed mb-6">{p.description}</p>
        
        <p className={`font-medium mb-6 ${p.stockQuantity ? "text-success" : "text-error"}`}>
          {p.stockQuantity ? `${p.stockQuantity} available` : "Out of stock"}
        </p>
        
        <div className="flex items-center gap-4 mb-8">
          <label htmlFor="qty" className="font-medium text-text-muted">Quantity</label>
          <input
            id="qty"
            className="input-field w-24 text-center"
            type="number"
            min="1"
            max={p.stockQuantity}
            value={qty}
            onChange={(e) =>
              setQty(Math.max(1, Math.min(p.stockQuantity, Number(e.target.value))))
            }
          />
        </div>
        
        <button className="btn-primary w-full md:w-auto" disabled={!p.stockQuantity} onClick={add}>
          Add to cart
        </button>
        
        {msg && (
          <p role="status" className="mt-4 p-3 bg-blue-50 text-blue-700 rounded border border-blue-200">
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { Page, Product, Category } from "../utils/types";
import { money } from "../utils";

export function ProductCard({ p }: { p: Product }) {
  return (
    <Link className="group block bg-surface rounded shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow" to={`/products/${p.slug}`}>
      <div className="aspect-w-4 aspect-h-3 bg-gray-100 flex items-center justify-center text-4xl text-gray-300">
        {p.imageUrl ? (
          <img src={p.imageUrl} alt={p.imageAltText || p.name} className="object-cover w-full h-full" />
        ) : (
          <span>{p.name.slice(0, 1)}</span>
        )}
      </div>
      <div className="p-4">
        <p className="text-sm text-text-muted mb-1">{p.categoryName}</p>
        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{p.name}</h3>
        <p className="font-bold mb-3">{money(p.price)}</p>
        <p className={`text-sm ${p.stockQuantity ? "text-success" : "text-error font-medium"}`}>
          {p.stockQuantity ? `${p.stockQuantity} in stock` : "Out of stock"}
        </p>
      </div>
    </Link>
  );
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  
  useEffect(() => {
    api<Page<Product>>("/products?pageSize=6").then((x) => setProducts(x.items));
    api<Category[]>("/categories").then(setCats);
  }, []);

  return (
    <>
      <section className="bg-primary/10 rounded-xl p-8 md:p-16 mb-12 flex flex-col md:flex-row items-center justify-between">
        <div className="max-w-xl">
          <p className="text-sm font-bold tracking-widest text-primary mb-3">EVERYDAY ESSENTIALS</p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-text">Simple things, thoughtfully chosen.</h1>
          <p className="text-lg text-text-muted mb-8">
            Discover practical products with a smooth, secure Cash on Delivery experience.
          </p>
          <Link className="btn-primary" to="/shop">
            Shop the collection
          </Link>
        </div>
        <div className="hidden md:flex text-9xl text-primary/20 select-none">✦</div>
      </section>

      <h2 className="text-2xl font-bold mb-6">Shop by category</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        {cats.map((c) => (
          <Link className="bg-surface border border-border rounded p-6 text-center font-semibold hover:border-primary hover:text-primary transition-colors" key={c.id} to={`/shop?categoryId=${c.id}`}>
            {c.name}
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Featured products</h2>
        <Link className="text-primary hover:underline font-medium" to="/shop">View all &rarr;</Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {products.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
    </>
  );
}

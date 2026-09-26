import React, { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { Page, Product, Category } from "../utils/types";
import { Loading, Banner, Empty, ProductSkeleton } from "../components/ui";
import { ProductCard } from "./Home";

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState<Page<Product> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Category[]>("/categories").then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    setError("");
    setLoading(true);
    // Add debounce for search typing
    const timer = setTimeout(() => {
      api<Page<Product>>(`/products?${params.toString()}`)
        .then(setData)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [params]);

  const update = (k: string, v: string) => {
    const n = new URLSearchParams(params);
    if (v) n.set(k, v);
    else n.delete(k);
    n.delete("page");
    setParams(n, { replace: true });
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <p className="text-sm font-bold tracking-widest text-primary mb-1">CATALOG</p>
          <h1 className="text-3xl font-bold">Shop all products</h1>
        </div>
        <Link className="btn-secondary" to="/cart">
          View cart
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-8 bg-surface p-4 rounded border border-border shadow-sm">
        <input
          className="input-field flex-1 min-w-[200px]"
          aria-label="Search products"
          placeholder="Search products"
          value={params.get("search") || ""}
          onChange={(e) => update("search", e.target.value)}
        />
        <select
          className="input-field sm:w-48"
          aria-label="Category filter"
          value={params.get("categoryId") || ""}
          onChange={(e) => update("categoryId", e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          className="input-field sm:w-48"
          aria-label="Sort"
          value={params.get("sort") || ""}
          onChange={(e) => update("sort", e.target.value)}
        >
          <option value="">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
          <option value="name_asc">Name</option>
        </select>
        <button 
          className="px-4 py-2 text-text-muted hover:text-text hover:bg-gray-100 rounded transition-colors" 
          onClick={() => setParams({}, { replace: true })}
        >
          Clear
        </button>
      </div>

      {error && <Banner text={error} />}

      {loading && !data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)}
        </div>
      ) : data?.items.length ? (
        <>
          <p className="text-text-muted mb-6">{data.totalItems} results</p>
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 ${loading ? 'opacity-50 pointer-events-none' : 'transition-opacity duration-200'}`}>
            {data.items.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
          
          {data.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: data.totalPages }, (_, i) => (
                <button
                  className={`w-10 h-10 rounded font-medium transition-colors ${
                    data.page === i + 1 
                      ? "bg-primary text-white" 
                      : "bg-surface border border-border hover:bg-gray-50 text-text"
                  }`}
                  key={i}
                  onClick={() => update("page", String(i + 1))}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <Empty text="No products match these filters." />
      )}
    </>
  );
}

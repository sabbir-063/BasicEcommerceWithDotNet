import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../../api/client";
import { Product, Page } from "../../utils/types";
import { money } from "../../utils";
import { Loading, Banner, Empty } from "../../components/ui";

function StockUpdater({ p, onUpdate }: { p: Product; onUpdate: () => void }) {
  const [stock, setStock] = useState(p.stockQuantity);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (stock === p.stockQuantity) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await api(`/admin/products/${p.id}/stock`, {
        method: "PATCH",
        body: JSON.stringify({ stockQuantity: stock }),
      });
      setEditing(false);
      onUpdate();
    } catch (e) {
      alert((e as Error).message);
      setStock(p.stockQuantity);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <button 
        className={`font-medium hover:underline flex items-center gap-1 ${p.stockQuantity > 0 ? "text-text" : "text-error"}`}
        onClick={() => setEditing(true)}
      >
        {p.stockQuantity} <span className="text-text-muted text-xs">✎</span>
      </button>
    );
  }

  return (
    <input 
      type="number" 
      min="0"
      className="input-field py-1 px-2 w-20 text-sm"
      value={stock}
      onChange={e => setStock(parseInt(e.target.value) || 0)}
      onBlur={save}
      onKeyDown={e => e.key === 'Enter' && save()}
      autoFocus
      disabled={saving}
    />
  );
}

export default function AdminProducts() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState<Page<Product> | null>(null);
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    api<Page<Product>>(`/products?${params.toString()}`)
      .then(setData)
      .catch((e) => setError(e.message));
  };

  useEffect(load, [params]);

  const update = (k: string, v: string) => {
    const n = new URLSearchParams(params);
    if (v) n.set(k, v);
    else n.delete(k);
    n.delete("page");
    setParams(n);
  };

  const toggle = async (id: string, active: boolean) => {
    try {
      await api(`/admin/products/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: active }),
      });
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link className="btn-primary" to="/admin/products/new">+ Add Product</Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-surface p-4 rounded shadow-sm border border-border">
        <input
          className="input-field flex-1"
          placeholder="Search by name..."
          value={params.get("search") || ""}
          onChange={(e) => update("search", e.target.value)}
        />
        <select
          className="input-field sm:w-48"
          value={params.get("sort") || ""}
          onChange={(e) => update("sort", e.target.value)}
        >
          <option value="">Newest first</option>
          <option value="name_asc">Name (A-Z)</option>
          <option value="price_asc">Price (Low to High)</option>
          <option value="price_desc">Price (High to Low)</option>
        </select>
        <button 
          className="px-4 py-2 text-text-muted hover:text-text hover:bg-gray-100 rounded transition-colors"
          onClick={() => setParams({})}
        >
          Clear
        </button>
      </div>

      {error && <Banner text={error} />}

      {!data ? (
        <Loading />
      ) : data.items.length ? (
        <>
          <div className="bg-surface rounded shadow-sm border border-border overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-border">
                  <tr>
                    <th className="py-3 px-4 font-semibold text-text">Product</th>
                    <th className="py-3 px-4 font-semibold text-text">Category</th>
                    <th className="py-3 px-4 font-semibold text-text">Price</th>
                    <th className="py-3 px-4 font-semibold text-text">Stock</th>
                    <th className="py-3 px-4 font-semibold text-text">Status</th>
                    <th className="py-3 px-4 font-semibold text-text text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.items.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400 shrink-0 overflow-hidden">
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt="" className="object-cover w-full h-full" />
                            ) : (
                              <span>{p.name.slice(0, 1)}</span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-text">{p.name}</p>
                            <p className="text-xs text-text-muted">{p.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-text-muted">{p.categoryName}</td>
                      <td className="py-3 px-4 font-medium">{money(p.price)}</td>
                      <td className="py-3 px-4">
                        <StockUpdater p={p} onUpdate={load} />
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.isActive ? "bg-success/10 text-success" : "bg-gray-100 text-gray-600"}`}>
                          {p.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-3">
                          <Link
                            to={`/admin/products/${p.id}/edit`}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => toggle(p.id, !p.isActive)}
                            className={`text-sm font-medium hover:underline ${p.isActive ? "text-error" : "text-success"}`}
                          >
                            {p.isActive ? "Disable" : "Enable"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
        <Empty text="No products found." />
      )}
    </div>
  );
}

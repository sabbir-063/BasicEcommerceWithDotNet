import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { Loading } from "../../components/ui";

export default function AdminDash() {
  const [s, setS] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Record<string, number>>("/admin/dashboard/summary")
      .then(setS)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Link className="btn-primary" to="/admin/products/new">+ New Product</Link>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Orders", key: "totalOrders", color: "bg-blue-50 text-blue-700 border-blue-200" },
          { label: "Total Users", key: "totalUsers", color: "bg-purple-50 text-purple-700 border-purple-200" },
          { label: "Active Products", key: "activeProducts", color: "bg-green-50 text-green-700 border-green-200" },
          { label: "Categories", key: "totalCategories", color: "bg-orange-50 text-orange-700 border-orange-200" },
        ].map((stat) => (
          <div key={stat.key} className={`p-6 rounded shadow-sm border ${stat.color}`}>
            <p className="text-sm font-medium mb-2 opacity-80">{stat.label}</p>
            <p className="text-4xl font-bold">{s[stat.key] || 0}</p>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/admin/orders" className="p-6 bg-surface border border-border rounded shadow-sm hover:border-primary hover:shadow-md transition-all group">
          <h2 className="text-xl font-semibold mb-2 group-hover:text-primary">Manage Orders &rarr;</h2>
          <p className="text-text-muted">View, process, and track customer orders.</p>
        </Link>
        <Link to="/admin/products" className="p-6 bg-surface border border-border rounded shadow-sm hover:border-primary hover:shadow-md transition-all group">
          <h2 className="text-xl font-semibold mb-2 group-hover:text-primary">Manage Products &rarr;</h2>
          <p className="text-text-muted">Add, edit, and update inventory and pricing.</p>
        </Link>
        <Link to="/admin/categories" className="p-6 bg-surface border border-border rounded shadow-sm hover:border-primary hover:shadow-md transition-all group">
          <h2 className="text-xl font-semibold mb-2 group-hover:text-primary">Manage Categories &rarr;</h2>
          <p className="text-text-muted">Organize your store catalog and hierarchy.</p>
        </Link>
      </div>
    </div>
  );
}

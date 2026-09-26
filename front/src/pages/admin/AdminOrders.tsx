import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../../api/client";
import { Order, Page } from "../../utils/types";
import { money } from "../../utils";
import { Loading, Banner, Empty } from "../../components/ui";
import { OrderStatusBadge } from "../orders/Orders";

export default function AdminOrders() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState<Page<Order> | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    api<Page<Order>>(`/admin/orders?${params.toString()}`)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [params]);

  const update = (k: string, v: string) => {
    const n = new URLSearchParams(params);
    if (v) n.set(k, v);
    else n.delete(k);
    n.delete("page");
    setParams(n);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Manage Orders</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-surface p-4 rounded shadow-sm border border-border">
        <input
          className="input-field flex-1"
          placeholder="Search by order number or customer name..."
          value={params.get("search") || ""}
          onChange={(e) => update("search", e.target.value)}
        />
        <select
          className="input-field sm:w-48"
          value={params.get("status") || ""}
          onChange={(e) => update("status", e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
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
                    <th className="py-3 px-4 font-semibold text-text">Order</th>
                    <th className="py-3 px-4 font-semibold text-text">Date</th>
                    <th className="py-3 px-4 font-semibold text-text">Customer</th>
                    <th className="py-3 px-4 font-semibold text-text">Amount</th>
                    <th className="py-3 px-4 font-semibold text-text">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.items.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50/50">
                      <td className="py-3 px-4">
                        <Link to={`/admin/orders/${o.id}`} className="font-medium text-primary hover:underline">
                          #{o.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-text-muted">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-medium">{o.customerName}</td>
                      <td className="py-3 px-4 font-bold">{money(o.totalAmount)}</td>
                      <td className="py-3 px-4">
                        <OrderStatusBadge status={o.status} />
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
        <Empty text="No orders found." />
      )}
    </div>
  );
}

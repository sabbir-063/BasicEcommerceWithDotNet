import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { Order, Page } from "../../utils/types";
import { money } from "../../utils";
import { Loading, Banner, Empty } from "../../components/ui";

export function OrderStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Processing: "bg-blue-100 text-blue-800 border-blue-200",
    Shipped: "bg-purple-100 text-purple-800 border-purple-200",
    Delivered: "bg-success/10 text-success border-success/20",
    Cancelled: "bg-error/10 text-error border-error/20",
  };
  const color = colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      {status}
    </span>
  );
}

export default function Orders() {
  const [data, setData] = useState<Page<Order> | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Page<Order>>("/orders")
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Your orders</h1>
      
      {error && <Banner text={error} />}
      
      {!data ? (
        <Loading />
      ) : data.items.length ? (
        <div className="flex flex-col gap-4">
          {data.items.map((o) => (
            <Link
              key={o.id}
              to={`/orders/${o.id}`}
              className="block bg-surface p-6 rounded shadow-sm border border-border hover:border-primary transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <div>
                  <p className="text-sm text-text-muted mb-1">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </p>
                  <h3 className="font-bold text-lg">Order #{o.orderNumber}</h3>
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-bold text-lg mb-1">{money(o.totalAmount)}</p>
                  <OrderStatusBadge status={o.status} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <Empty text="You haven't placed any orders yet." action={<Link className="btn-primary inline-block" to="/shop">Start shopping</Link>} />
      )}
    </div>
  );
}

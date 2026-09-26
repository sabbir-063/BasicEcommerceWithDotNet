import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../../api/client";
import { Order } from "../../utils/types";
import { money } from "../../utils";
import { Loading, Banner } from "../../components/ui";
import { OrderStatusBadge } from "../orders/Orders";

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [o, setO] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const load = () => {
    api<Order>(`/admin/orders/${id}`)
      .then(setO)
      .catch((e) => setError(e.message));
  };

  useEffect(load, [id]);

  if (!o && !error) return <Loading />;
  if (error) return <Banner text={error} />;
  if (!o) return null;

  const updateStatus = async (status: string) => {
    setMsg("");
    try {
      await api(`/admin/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      load();
      setMsg(`Order status updated to ${status}`);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
        <Link to="/admin/orders" className="hover:text-primary">Admin Orders</Link>
        <span>/</span>
        <span>#{o.orderNumber}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Order #{o.orderNumber}</h1>
          <p className="text-text-muted">Placed on {new Date(o.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-text-muted">Current Status:</span>
          <OrderStatusBadge status={o.status} />
        </div>
      </div>

      {msg && <Banner text={msg} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface rounded shadow-sm border border-border overflow-hidden">
            <h2 className="text-lg font-semibold p-4 bg-gray-50 border-b border-border">Order Items</h2>
            <div className="divide-y divide-border">
              {o.items?.map((i) => (
                <div key={i.id} className="p-4 flex items-center justify-between">
                  <div>
                    <Link to={`/products/${i.productId}`} className="font-semibold text-primary hover:underline block mb-1">
                      {i.productName}
                    </Link>
                    <p className="text-sm text-text-muted">{i.quantity} &times; {money(i.unitPrice)}</p>
                  </div>
                  <strong className="text-lg">{money(i.lineTotal)}</strong>
                </div>
              ))}
            </div>
            <div className="p-4 bg-gray-50 border-t border-border flex justify-between items-center">
              <span className="font-bold">Total Amount</span>
              <span className="text-xl font-bold text-primary">{money(o.totalAmount)}</span>
            </div>
          </div>
          
          <div className="bg-surface rounded shadow-sm border border-border p-6">
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-border">Update Status</h2>
            <div className="flex flex-wrap gap-3">
              {["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((status) => (
                <button
                  key={status}
                  onClick={() => updateStatus(status)}
                  disabled={o.status === status}
                  className={`px-4 py-2 rounded font-medium border ${
                    o.status === status 
                      ? "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
                      : "bg-white text-text border-border hover:border-primary hover:text-primary shadow-sm"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface rounded shadow-sm border border-border p-4">
            <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">Customer & Shipping</h2>
            <p className="font-medium mb-1">{o.customerName}</p>
            <p className="text-text-muted mb-3">{o.phone}</p>
            <p className="text-text-muted whitespace-pre-wrap leading-relaxed">{o.shippingAddress}</p>
          </div>
          
          <div className="bg-surface rounded shadow-sm border border-border p-4">
            <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">Payment Details</h2>
            <p className="text-text-muted mb-2">Method: <strong className="text-text">{o.paymentMethod}</strong></p>
            <p className="text-text-muted mb-2">Total Amount: <strong className="text-text">{money(o.totalAmount)}</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}

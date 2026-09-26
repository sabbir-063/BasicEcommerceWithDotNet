import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../../api/client";
import { Order } from "../../utils/types";
import { money } from "../../utils";
import { Loading, Banner } from "../../components/ui";
import { OrderStatusBadge } from "./Orders";

export default function OrderDetail() {
  const { id } = useParams();
  const [o, setO] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const load = () => {
    api<Order>(`/orders/${id}`)
      .then(setO)
      .catch((e) => setError(e.message));
  };

  useEffect(load, [id]);

  if (!o && !error) return <Loading />;
  if (error) return <Banner text={error} />;
  if (!o) return null;

  const cancel = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    setMsg("");
    try {
      await api(`/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "Cancelled" }),
      });
      load();
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
        <Link to="/orders" className="hover:text-primary">Orders</Link>
        <span>/</span>
        <span>#{o.orderNumber}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Order #{o.orderNumber}</h1>
          <p className="text-text-muted">Placed on {new Date(o.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-4">
          <OrderStatusBadge status={o.status} />
          {o.status === "Pending" && (
            <button
              className="text-error hover:text-red-700 hover:underline font-medium px-2 py-1"
              onClick={cancel}
              disabled={cancelling}
            >
              {cancelling ? "Cancelling..." : "Cancel Order"}
            </button>
          )}
        </div>
      </div>

      {msg && <Banner text={msg} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
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
        </div>

        <div className="space-y-6">
          <div className="bg-surface rounded shadow-sm border border-border p-4">
            <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">Shipping Information</h2>
            <p className="font-medium mb-1">{o.customerName}</p>
            <p className="text-text-muted mb-3">{o.phone}</p>
            <p className="text-text-muted whitespace-pre-wrap leading-relaxed">{o.shippingAddress}</p>
          </div>
          
          <div className="bg-surface rounded shadow-sm border border-border p-4">
            <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">Payment</h2>
            <p className="text-text-muted mb-1">Method: <strong className="text-text">{o.paymentMethod}</strong></p>
            <p className="text-text-muted">Status: <strong className="text-text">{o.status === "Delivered" ? "Paid" : "Pending"}</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}

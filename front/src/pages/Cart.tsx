import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { Cart as CartType } from "../utils/types";
import { money } from "../utils";
import { Loading, Banner, Empty } from "../components/ui";
import { useAuth } from "../hooks/useAuth";

export default function Cart() {
  const [cart, setCart] = useState<CartType | null>(null);
  const [error, setError] = useState("");
  const { refreshCart } = useAuth();

  const load = () =>
    api<CartType>("/cart")
      .then(setCart)
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  if (!cart && !error) return <Loading />;

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Your cart</h1>
      
      {error && <Banner text={error} />}
      
      {cart && !cart.items.length ? (
        <Empty
          text="Your cart is empty."
          action={
            <Link className="btn-primary inline-block" to="/shop">
              Continue shopping
            </Link>
          }
        />
      ) : cart ? (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="bg-surface rounded shadow-sm border border-border divide-y divide-border">
              {cart.items.map((i) => (
                <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-6" key={i.id}>
                  <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-xl text-gray-400 shrink-0 overflow-hidden">
                    {i.imageUrl ? (
                      <img src={i.imageUrl} alt={i.productName} className="object-cover w-full h-full" />
                    ) : (
                      <span>{i.productName.slice(0, 1)}</span>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{i.productName}</h3>
                    <p className="text-text-muted">{money(i.unitPrice)} each</p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <input
                      aria-label={`Quantity for ${i.productName}`}
                      type="number"
                      className="input-field w-20 text-center"
                      min="1"
                      max={i.availableStock}
                      value={i.quantity}
                      onChange={async (e) => {
                        try {
                          await api(`/cart/items/${i.id}`, {
                            method: "PATCH",
                            body: JSON.stringify({
                              quantity: Number(e.target.value),
                            }),
                          });
                          load();
                          refreshCart();
                        } catch (e) {
                          setError((e as Error).message);
                        }
                      }}
                    />
                    <strong className="w-24 text-right">{money(i.lineTotal)}</strong>
                    <button
                      className="text-error hover:text-red-700 hover:underline p-2"
                      title="Remove item"
                      onClick={async () => {
                        await api(`/cart/items/${i.id}`, { method: "DELETE" });
                        load();
                        refreshCart();
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <aside className="w-full lg:w-80 shrink-0">
            <div className="bg-surface rounded shadow-sm border border-border p-6 sticky top-8">
              <h2 className="text-xl font-bold mb-4">Summary</h2>
              <div className="flex justify-between mb-2">
                <span className="text-text-muted">Total items</span>
                <span className="font-medium">{cart.itemCount}</span>
              </div>
              <div className="flex justify-between mb-6 pt-4 border-t border-border">
                <span className="font-bold">Total</span>
                <span className="font-bold text-xl">{money(cart.totalAmount)}</span>
              </div>
              <Link className="btn-primary w-full block text-center py-3 text-lg" to="/checkout">
                Checkout
              </Link>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "../api/client";
import { Cart, Order } from "../utils/types";
import { money } from "../utils";
import { Loading, Banner, Empty } from "../components/ui";
import { useAuth } from "../hooks/useAuth";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name is required").max(100),
  phone: z.string().min(5, "Phone is required").max(20),
  shippingAddress: z.string().min(10, "Full shipping address is required").max(500),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [error, setError] = useState("");
  const nav = useNavigate();
  const { user, refreshCart } = useAuth();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: user?.name || "",
      phone: user?.phone || "",
      shippingAddress: "",
    }
  });

  useEffect(() => {
    api<Cart>("/cart")
      .then(setCart)
      .catch((e) => setError(e.message));
  }, []);

  if (!cart && !error) return <Loading />;
  
  if (cart && !cart.items.length) {
    return (
      <Empty
        text="Add items before checkout."
        action={
          <Link className="btn-primary inline-block" to="/shop">
            Shop now
          </Link>
        }
      />
    );
  }

  const submit = async (data: CheckoutForm) => {
    setError("");
    try {
      const o = await api<Order>("/checkout", {
        method: "POST",
        body: JSON.stringify(data),
      });
      refreshCart();
      nav(`/orders/${o.id}`);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      {error && <Banner text={error} />}
      
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <form onSubmit={handleSubmit(submit)} className="flex-1 bg-surface p-6 rounded shadow-sm border border-border flex flex-col gap-4">
          <h2 className="text-xl font-semibold mb-2">Shipping Details</h2>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Full name
              <input {...register("customerName")} className="input-field block w-full mt-1" />
            </label>
            {errors.customerName && <p className="text-error text-sm mt-1">{errors.customerName.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Phone
              <input {...register("phone")} className="input-field block w-full mt-1" />
            </label>
            {errors.phone && <p className="text-error text-sm mt-1">{errors.phone.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Shipping address
              <textarea {...register("shippingAddress")} rows={4} className="input-field resize-y block w-full mt-1" />
            </label>
            {errors.shippingAddress && <p className="text-error text-sm mt-1">{errors.shippingAddress.message}</p>}
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded text-blue-800 text-sm">
            <strong>Payment Method:</strong> Cash on Delivery (COD) only.
          </div>
          
          <button type="submit" disabled={isSubmitting} className="btn-primary mt-4 py-3 text-lg font-bold">
            {isSubmitting ? "Processing..." : "Place Order"}
          </button>
        </form>
        
        {cart && (
          <aside className="w-full md:w-80 bg-surface p-6 rounded shadow-sm border border-border sticky top-8">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="divide-y divide-border mb-4 max-h-96 overflow-y-auto pr-2">
              {cart.items.map((i) => (
                <div key={i.id} className="py-3 flex justify-between text-sm">
                  <span className="text-text-muted pr-4">{i.quantity}x {i.productName}</span>
                  <span className="font-medium whitespace-nowrap">{money(i.lineTotal)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-4 border-t border-border font-bold text-lg">
              <span>Total</span>
              <span>{money(cart.totalAmount)}</span>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

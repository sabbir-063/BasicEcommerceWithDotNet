import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../hooks/useAuth";
import { Layout } from "../components/Layout";
import { Guard } from "../components/Guard";

// Pages
import Home from "../pages/Home";
import Shop from "../pages/Shop";
import ProductDetail from "../pages/ProductDetail";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Profile from "../pages/auth/Profile";
import ChangePassword from "../pages/auth/ChangePassword";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import Orders from "../pages/orders/Orders";
import OrderDetail from "../pages/orders/OrderDetail";
import AdminRoutes from "./admin";

function NotFound() {
  return (
    <div className="text-center py-20 bg-surface rounded shadow-sm border border-border">
      <h1 className="text-3xl font-bold mb-6">Page not found</h1>
      <a className="btn-primary" href="/">Back home</a>
    </div>
  );
}

function Forbidden() {
  return (
    <div className="text-center py-20 bg-surface rounded shadow-sm border border-border">
      <h1 className="text-3xl font-bold mb-6 text-error">403 Forbidden</h1>
      <p className="text-text-muted mb-6">You do not have permission to access this resource.</p>
      <a className="btn-primary" href="/">Back home</a>
    </div>
  );
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/profile" element={<Guard><Profile /></Guard>} />
            <Route path="/change-password" element={<Guard><ChangePassword /></Guard>} />
            
            <Route path="/cart" element={<Guard><Cart /></Guard>} />
            <Route path="/checkout" element={<Guard><Checkout /></Guard>} />
            
            <Route path="/orders" element={<Guard><Orders /></Guard>} />
            <Route path="/orders/:id" element={<Guard><OrderDetail /></Guard>} />
            
            <Route path="/admin/*" element={<Guard admin><AdminRoutes /></Guard>} />
            
            <Route path="/403" element={<Forbidden />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

import React from "react";
import { Routes, Route } from "react-router-dom";

import AdminDash from "../pages/admin/AdminDash";
import AdminCategories from "../pages/admin/AdminCategories";
import AdminProducts from "../pages/admin/AdminProducts";
import AdminProductForm from "../pages/admin/AdminProductForm";
import AdminOrders from "../pages/admin/AdminOrders";
import AdminOrderDetail from "../pages/admin/AdminOrderDetail";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route index element={<AdminDash />} />
      <Route path="categories" element={<AdminCategories />} />
      <Route path="products" element={<AdminProducts />} />
      <Route path="products/new" element={<AdminProductForm />} />
      <Route path="products/:id/edit" element={<AdminProductForm />} />
      <Route path="orders" element={<AdminOrders />} />
      <Route path="orders/:id" element={<AdminOrderDetail />} />
    </Routes>
  );
}

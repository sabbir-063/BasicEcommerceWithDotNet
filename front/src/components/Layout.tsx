import React from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="bg-surface border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-text-muted text-sm">
          Cash on Delivery &middot; Secure ordering &middot; &copy; 2026 BasicCommerce
        </div>
      </footer>
    </div>
  );
}

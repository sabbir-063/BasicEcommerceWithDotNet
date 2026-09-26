import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function Header() {
  const { user, cartCount, logout } = useAuth();

  return (
    <header className="bg-surface border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link className="text-xl font-bold tracking-tight text-primary" to="/">
          BasicCommerce
        </Link>
        <nav className="flex items-center gap-6">
          <Link className="font-medium hover:text-primary transition-colors" to="/shop">Shop</Link>
          {user && <Link className="font-medium hover:text-primary transition-colors" to="/cart">Cart ({cartCount})</Link>}
          {user && <Link className="font-medium hover:text-primary transition-colors" to="/orders">Orders</Link>}
          {user?.role === "Admin" && <Link className="font-medium hover:text-primary transition-colors" to="/admin">Admin</Link>}
          
          <div className="flex items-center gap-4 ml-4 pl-4 border-l border-border">
            {user ? (
              <>
                <Link className="font-medium hover:text-primary transition-colors" to="/profile">{user.name}</Link>
                <button className="text-text-muted hover:text-text transition-colors" onClick={logout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link className="font-medium hover:text-primary transition-colors" to="/login">Login</Link>
                <Link className="btn-primary" to="/register">
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

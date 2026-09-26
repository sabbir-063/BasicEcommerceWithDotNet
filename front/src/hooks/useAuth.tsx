import React, { createContext, useContext, useState, ReactNode } from "react";
import { User } from "../utils/types";
import { api } from "../api/client";
import { useEffect } from "../utils";

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  cartCount: number;
  setCartCount: (count: number) => void;
  logout: () => void;
  refreshCart: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (sessionStorage.getItem("token")) {
      api<User>("/auth/me")
        .then(setUser)
        .catch(() => setUser(null));
    }
    const onUnauthorized = () => {
      setUser(null);
      setCartCount(0);
    };
    window.addEventListener("auth:unauthorized", onUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", onUnauthorized);
  }, []);

  const refreshCart = () => {
    if (user) {
      api<{ itemCount: number }>("/cart")
        .then((c) => setCartCount(c.itemCount))
        .catch(() => {});
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  const logout = () => {
    sessionStorage.removeItem("token");
    setUser(null);
    setCartCount(0);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, cartCount, setCartCount, logout, refreshCart }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

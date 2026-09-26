import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Loading } from "./ui";

export function Guard({
  admin,
  children,
}: {
  admin?: boolean;
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return sessionStorage.getItem("token") ? (
      <Loading />
    ) : (
      <Navigate to={`/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`} replace />
    );
  }

  if (admin && user.role !== "Admin") {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}

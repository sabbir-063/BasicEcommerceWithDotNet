import React from "react";
import { createRoot } from "react-dom/client";
import { AppRoutes } from "./routes";
import "./styles.css";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <React.StrictMode>
      <AppRoutes />
    </React.StrictMode>
  );
}

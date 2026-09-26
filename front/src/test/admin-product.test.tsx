import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { expect, test, vi, beforeEach } from "vitest";
import React from "react";
import { AdminProductForm } from "../main"; // export it
import { api } from "../api/client";

vi.mock("../api/client", () => ({
  api: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();
});

test("AdminProductForm preserves existing product data", async () => {
  vi.mocked(api).mockImplementation(async (url) => {
    if (url === "/admin/categories") return [{ id: "cat1", name: "Category 1" }];
    if (url === "/products/prod1") return {
      id: "prod1",
      categoryId: "cat1",
      name: "Existing Product",
      description: "Existing desc",
      price: 150,
      stockQuantity: 20,
      imageUrl: "http://image.com/1.png",
      imagePublicId: "pub1",
      imageAltText: "alt 1",
      isActive: true
    };
    return {};
  });

  render(
    <MemoryRouter initialEntries={["/admin/products/prod1"]}>
      <Routes>
        <Route path="/admin/products/:id" element={<AdminProductForm />} />
      </Routes>
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(screen.getByDisplayValue("Existing Product")).toBeInTheDocument();
  });
  expect(screen.getByDisplayValue("150")).toBeInTheDocument();
  expect(screen.getByDisplayValue("20")).toBeInTheDocument();
});

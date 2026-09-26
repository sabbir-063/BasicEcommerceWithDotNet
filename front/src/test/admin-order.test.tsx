import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { expect, test, vi, beforeEach } from "vitest";
import React from "react";
import AdminOrderDetail from "../pages/admin/AdminOrderDetail";
import { api } from "../api/client";

vi.mock("../api/client", () => ({
  api: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();
});

test("AdminOrderDetail renders correct next status actions for Pending", async () => {
  vi.mocked(api).mockResolvedValueOnce({
    id: "ord1",
    orderNumber: "ORD-123",
    customerName: "Test",
    status: "Pending",
    totalAmount: 100,
    items: []
  });

  render(
    <MemoryRouter initialEntries={["/admin/orders/ord1"]}>
      <Routes>
        <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
      </Routes>
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(screen.getByText("Order #ORD-123")).toBeInTheDocument();
  });

  expect(screen.getByRole("button", { name: "Processing" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Cancelled" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Shipped" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Pending" })).toBeDisabled();
});

test("AdminOrderDetail updates status", async () => {
  const user = userEvent.setup();
  vi.mocked(api).mockResolvedValueOnce({
    id: "ord1",
    orderNumber: "ORD-123",
    customerName: "Test",
    status: "Processing",
    totalAmount: 100,
    items: []
  });

  render(
    <MemoryRouter initialEntries={["/admin/orders/ord1"]}>
      <Routes>
        <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
      </Routes>
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(screen.getAllByRole("button", { name: "Shipped" })[0]).toBeInTheDocument();
  });

  vi.mocked(api)
    .mockResolvedValueOnce({}) // For PATCH
    .mockResolvedValueOnce({   // For load()
      id: "ord1",
      orderNumber: "ORD-123",
      customerName: "Test",
      status: "Shipped",
      totalAmount: 100,
      items: []
    });
  await user.click(screen.getAllByRole("button", { name: "Shipped" })[0]);

  expect(api).toHaveBeenCalledWith("/admin/orders/ord1/status", expect.objectContaining({
    method: "PATCH",
    body: JSON.stringify({ status: "Shipped" })
  }));
});

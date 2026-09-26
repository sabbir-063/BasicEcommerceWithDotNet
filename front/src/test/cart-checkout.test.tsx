import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { expect, test, vi, beforeEach } from "vitest";
import React from "react";
import Checkout from "../pages/Checkout";
import { api } from "../api/client";
import { useAuth } from "../hooks/useAuth";

vi.mock("../api/client", () => ({
  api: vi.fn(),
}));

vi.mock("../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();
});

test("Checkout locks submission while busy", async () => {
  const user = userEvent.setup();
  
  vi.mocked(useAuth).mockReturnValue({
    user: { id: "1", name: "C", email: "c@c.c", role: "Customer" },
    refreshCart: vi.fn(),
  } as any);

  vi.mocked(api).mockResolvedValueOnce({
    id: "cart1",
    itemCount: 1,
    totalAmount: 100,
    items: [
      { id: "item1", productId: "p1", productName: "Product 1", unitPrice: 100, quantity: 1, availableStock: 10, lineTotal: 100 }
    ]
  });

  // Delay the checkout response to simulate network delay
  vi.mocked(api).mockImplementationOnce(async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { id: "order1" };
  });

  render(
    <MemoryRouter initialEntries={["/checkout"]}>
      <Routes>
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(screen.getByRole("heading", { name: "Checkout" })).toBeInTheDocument();
  });

  await user.type(screen.getByLabelText("Full name"), "Test User");
  await user.type(screen.getByLabelText("Phone"), "1234567890");
  await user.type(screen.getByLabelText("Shipping address"), "123 Test St");

  const button = screen.getByRole("button", { name: "Place Order" });
  await user.click(button);

  // Button should be disabled and say Processing...
  expect(button).toBeDisabled();
  expect(button).toHaveTextContent("Processing...");

  // Wait for the mock to resolve
  await waitFor(() => {
    expect(api).toHaveBeenCalledTimes(2); // Initial cart fetch + POST order
  });
});

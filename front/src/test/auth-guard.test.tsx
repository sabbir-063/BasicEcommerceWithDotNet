import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { expect, test, vi } from "vitest";
import React from "react";
import { Guard } from "../components/Guard";
import Login from "../pages/auth/Login";
import { User } from "../utils/types";
import { api } from "../api/client";
import { useAuth } from "../hooks/useAuth";

vi.mock("../api/client", () => ({
  api: vi.fn(),
}));

vi.mock("../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname + location.search}</div>;
}

test("Guard redirects unauthenticated users to login with returnTo", async () => {
  vi.mocked(useAuth).mockReturnValue({ user: null } as any);
  render(
    <MemoryRouter initialEntries={["/protected?some=value"]}>
      <Routes>
        <Route path="/login" element={<LocationDisplay />} />
        <Route
          path="/protected"
          element={
            <Guard>
              <div data-testid="protected">Protected Content</div>
            </Guard>
          }
        />
      </Routes>
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(screen.getByTestId("location").textContent).toBe(
      "/login?returnTo=%2Fprotected%3Fsome%3Dvalue"
    );
  });
});

test("Guard redirects non-admin users to 403 on admin routes", async () => {
  const customer: User = {
    id: "1",
    name: "Customer",
    email: "c@test.com",
    role: "Customer",
  };
  vi.mocked(useAuth).mockReturnValue({ user: customer } as any);

  render(
    <MemoryRouter initialEntries={["/admin"]}>
      <Routes>
        <Route path="/403" element={<div data-testid="403">Forbidden</div>} />
        <Route
          path="/admin"
          element={
            <Guard admin>
              <div data-testid="admin">Admin Content</div>
            </Guard>
          }
        />
      </Routes>
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(screen.getByTestId("403")).toBeInTheDocument();
  });
});

test("Login redirects to returnTo URL on successful login", async () => {
  const user = userEvent.setup();
  const mockUser: User = {
    id: "1",
    name: "Customer",
    email: "test@test.com",
    role: "Customer",
  };

  vi.mocked(api).mockResolvedValueOnce({
    accessToken: "fake-token",
    user: mockUser,
  });

  const setUser = vi.fn();
  vi.mocked(useAuth).mockReturnValue({ setUser } as any);

  render(
    <MemoryRouter initialEntries={["/login?returnTo=%2Fcheckout"]}>
      <Routes>
        <Route path="/checkout" element={<div data-testid="checkout">Checkout</div>} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </MemoryRouter>
  );

  await user.type(screen.getByLabelText("Email"), "test@test.com");
  await user.type(screen.getByLabelText("Password"), "password");
  await user.click(screen.getByRole("button", { name: "Sign in" }));

  await waitFor(() => {
    expect(setUser).toHaveBeenCalledWith(mockUser);
    expect(screen.getByTestId("checkout")).toBeInTheDocument();
  });
});

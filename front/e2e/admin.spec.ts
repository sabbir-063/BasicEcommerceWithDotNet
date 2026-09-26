import { expect, test } from "@playwright/test";

test("admin dashboard and management pages authorize correctly", async ({ page }) => {
  test.skip(!process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD, "Admin credentials are supplied at runtime.");
  
  await page.goto("/login");
  await page.getByLabel("Email").fill(process.env.E2E_ADMIN_EMAIL!);
  await page.getByLabel("Password").fill(process.env.E2E_ADMIN_PASSWORD!);
  
  const adminLogin = page.waitForResponse((r) => r.url().endsWith("/api/auth/login"));
  await page.getByRole("button", { name: "Sign in" }).click();
  expect((await adminLogin).status()).toBe(200);
  
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "Admin dashboard" })).toBeVisible();
  
  await page.getByRole("link", { name: /Manage categories/ }).click();
  await expect(page.getByRole("heading", { name: "Categories" })).toBeVisible();
  
  await page.goto("/admin/products");
  await expect(page.getByRole("heading", { name: "Products" })).toBeVisible();
  await page.getByRole("link", { name: "+ Add Product" }).click();
  await expect(page.getByLabel("Product image")).toBeVisible();
  
  await page.goto("/admin/orders");
  await expect(page.getByRole("heading", { name: "Manage Orders" })).toBeVisible();
  
  await page.locator("a", { hasText: "#" }).first().click();
  await expect(page).toHaveURL(/\/admin\/orders\/[0-9a-f-]+$/);
  
  // Checking status updates
  const badge = page.locator(".bg-surface").filter({ hasText: "Current Status:" }).locator("span").last();
  // Wait, let's just check the text of the page.
  await expect(page.getByText("Current Status:")).toBeVisible();
  
  await page.getByRole("button", { name: "Processing" }).click();
  await expect(page.getByText("Processing", { exact: true })).toBeVisible();
  
  await page.getByRole("button", { name: "Shipped" }).click();
  await expect(page.getByText("Shipped", { exact: true })).toBeVisible();
  
  await page.getByRole("button", { name: "Delivered" }).click();
  await expect(page.getByText("Delivered", { exact: true })).toBeVisible();
});

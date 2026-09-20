import { expect, test } from "@playwright/test";

test("public catalog and complete COD customer journey", async ({ page }) => {
  const apiStatuses: number[] = [];
  page.on("response", (response) => {
    if (response.url().includes("/api/")) apiStatuses.push(response.status());
  });

  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Simple things, thoughtfully chosen." }),
  ).toBeVisible();
  await expect(page.getByText("Featured products")).toBeVisible();
  await page.getByRole("link", { name: "Shop", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Shop all products" }),
  ).toBeVisible();
  await page.getByLabel("Search products").fill("Wireless");
  await expect(page.getByText("Wireless Headphones")).toBeVisible();
  await page.getByText("Wireless Headphones").click();
  await expect(
    page.getByRole("heading", { name: "Wireless Headphones" }),
  ).toBeVisible();

  const email = `e2e-${Date.now()}@example.test`;
  await page.goto("/register");
  await page.getByLabel("Name").fill("E2E Customer");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Phone").fill("01700000000");
  await page.getByLabel("Password", { exact: true }).fill("SafePass123!");
  await page.getByLabel("Confirm password").fill("SafePass123!");
  await page.getByRole("button", { name: "Register" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("SafePass123!");
  const customerLogin = page.waitForResponse((r) =>
    r.url().endsWith("/api/auth/login"),
  );
  await page.getByRole("button", { name: "Sign in" }).click();
  expect((await customerLogin).status()).toBe(200);
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText("E2E Customer")).toBeVisible();

  await page.goto("/products/wireless-headphones");
  await page.getByRole("button", { name: "Add to cart" }).click();
  await expect(page.getByText("Added to cart")).toBeVisible();
  await page.getByRole("link", { name: /Cart/ }).click();
  await expect(page.getByRole("heading", { name: "Your cart" })).toBeVisible();
  await expect(page.getByText("Wireless Headphones")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Wireless Headphones")).toBeVisible();
  await page.getByRole("link", { name: "Checkout" }).click();
  await page.getByLabel("Full name").fill("E2E Customer");
  await page.getByLabel("Phone").fill("01700000000");
  await page.getByLabel("Shipping address").fill("House 1, Road 2, Dhaka");
  await expect(
    page.getByText("Cash on Delivery", { exact: true }),
  ).toBeVisible();
  const checkoutResponse = page.waitForResponse(
    (r) => r.url().endsWith("/api/orders") && r.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Place order" }).click();
  expect((await checkoutResponse).status()).toBe(201);
  await expect(page.getByText("ORDER CONFIRMATION")).toBeVisible();
  await expect(page.getByText("Pending")).toBeVisible();
  await expect(page.getByText("Wireless Headphones")).toBeVisible();
  await page.getByRole("link", { name: "Orders" }).click();
  await expect(page.getByRole("heading", { name: "My orders" })).toBeVisible();
  expect(apiStatuses.some((s) => s >= 500)).toBeFalsy();
});

test("admin dashboard and management pages authorize correctly", async ({
  page,
}) => {
  test.skip(
    !process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD,
    "Admin credentials are supplied at runtime.",
  );
  await page.goto("/login");
  await page.getByLabel("Email").fill(process.env.E2E_ADMIN_EMAIL!);
  await page.getByLabel("Password").fill(process.env.E2E_ADMIN_PASSWORD!);
  const adminLogin = page.waitForResponse((r) =>
    r.url().endsWith("/api/auth/login"),
  );
  await page.getByRole("button", { name: "Sign in" }).click();
  expect((await adminLogin).status()).toBe(200);
  await expect(page).toHaveURL(/\/admin$/);
  await expect(
    page.getByRole("heading", { name: "Admin dashboard" }),
  ).toBeVisible();
  await page.getByRole("link", { name: /Manage categories/ }).click();
  await expect(page.getByRole("heading", { name: "Categories" })).toBeVisible();
  await page.goto("/admin/products");
  await expect(page.getByRole("heading", { name: "Products" })).toBeVisible();
  await page.getByRole("link", { name: "Add product" }).click();
  await expect(page.getByLabel("Product image")).toBeVisible();
  await page.goto("/admin/orders");
  await expect(page.getByRole("heading", { name: "Orders" })).toBeVisible();
  await page.locator("a.tablerow").first().click();
  await expect(page).toHaveURL(/\/admin\/orders\/[0-9a-f-]+$/);
  await expect(page.locator(".badge")).toHaveText("Pending");
  await page.getByRole("button", { name: "Confirmed" }).click();
  await expect(page.locator(".badge")).toHaveText("Confirmed");
  await page.getByRole("button", { name: "Shipped" }).click();
  await expect(page.locator(".badge")).toHaveText("Shipped");
  await page.getByRole("button", { name: "Delivered" }).click();
  await expect(page.locator(".badge")).toHaveText("Delivered");
});

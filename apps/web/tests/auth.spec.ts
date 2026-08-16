import { expect, test } from "@playwright/test";

test.describe("mock authentication flow", () => {
  test("shows an error for invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("maya@northstar.example");
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(
      page.getByText(
        "We could not sign you in. Check your credentials and try again.",
      ),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("signs in and redirects to the workspace", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("maya@northstar.example");
    await page.getByLabel("Password").fill("demo-password");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(
      page.getByRole("heading", { name: "Good morning, Maya Chen." }),
    ).toBeVisible();
  });

  test("signs out from the workspace and returns to login", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(
      page.getByRole("heading", { name: "Good morning, Maya Chen." }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Open profile menu" }).click();
    await page.getByRole("menuitem", { name: "Sign out" }).click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole("heading", { name: "Welcome back" }),
    ).toBeVisible();
  });
});

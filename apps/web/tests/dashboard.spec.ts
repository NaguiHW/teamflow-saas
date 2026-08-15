import { expect, test } from "@playwright/test";

test.describe("mock workspace flow", () => {
  test("lets a user explore projects and move a task", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(
      page.getByRole("heading", { name: "Good morning, Maya." }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Website launch" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Task board" }),
    ).toBeVisible();

    await page
      .getByRole("button", { name: "Move Review homepage messaging to Done" })
      .click();
    await expect(page.getByText("Task status updated")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Review homepage messaging" }),
    ).toBeVisible();
  });

  test("keeps the workspace usable on a mobile viewport", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(
      page.getByRole("heading", { name: "Good morning, Maya." }),
    ).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(
      await page.evaluate(() => document.documentElement.clientWidth),
    );
  });
});

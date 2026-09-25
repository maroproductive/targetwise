import { test, expect } from "@playwright/test";
test("desktop, mobile, Arabic, service details and WhatsApp message", async ({
  page,
}) => {
  await page.goto("/en");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "The right audience.",
  );
  await expect(page.locator("img").first()).toBeVisible();
  await page.screenshot({ path: "test-results/desktop.png", fullPage: true });
  await page.getByRole("link", { name: /Paid advertising/ }).click();
  await expect(page).toHaveURL(/services\/paid-advertising/);
  await page
    .getByRole("button", { name: "Let’s talk about your business" })
    .first()
    .click();
  await page
    .getByLabel("Your business / industry")
    .fill("Online clothing store");
  await page
    .getByLabel("What would you like to achieve?")
    .fill("More qualified enquiries");
  await page.getByLabel("Your budget in USD").selectOption("$600–$1,500");
  await page.getByRole("button", { name: "Prepare my message" }).click();
  const href = await page
    .getByRole("link", { name: "Continue to WhatsApp" })
    .getAttribute("href");
  expect(href).toContain("https://wa.me/96170173853");
  expect(decodeURIComponent(href!)).toContain("Paid advertising");
  expect(decodeURIComponent(href!)).toContain("Online clothing store");
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en");
  await page.getByRole("button", { name: "Toggle menu" }).click();
  await page.getByRole("link", { name: "Packages", exact: true }).click();
  await expect(page.locator(".nav")).not.toHaveClass(/open/);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({ path: "test-results/mobile.png", fullPage: true });
  await page.getByRole("link", { name: "Switch to Arabic" }).click();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "الجمهور الصح",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({ path: "test-results/arabic.png", fullPage: true });
});
(process.env.TEST_PUBLIC_ONLY ? test.skip : test)(
  "admin signs in, creates package, persists edits, settings and deletion",
  async ({ page }) => {
    await page.goto("/admin");
    await page.getByLabel("Email", { exact: true }).fill("admin@example.test");
    await page
      .getByLabel("Password", { exact: true })
      .fill("test-only-password-2026");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Services", exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Packages", exact: true }).click();
    await page.getByRole("button", { name: "Add new" }).click();
    await page.getByLabel("URL identifier").fill("test-package");
    await page
      .getByLabel("English", { exact: true })
      .nth(0)
      .fill("Integration test package");
    await page
      .getByLabel("العربية", { exact: true })
      .nth(0)
      .fill("باقة اختبار");
    await page.getByLabel("Related service").selectOption("paid-advertising");
    await page.getByLabel("Price (USD)").fill("800");
    await page.getByLabel("Show price publicly").check();
    await page.getByLabel("Published", { exact: true }).check();
    await page.getByRole("button", { name: "Save item" }).click();
    await expect(page.getByRole("status")).toHaveText("Saved successfully.");
    await page.reload();
    await page.getByRole("button", { name: "Packages", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Integration test package" }),
    ).toBeVisible();
    const publicPage = await page.context().newPage();
    await publicPage.goto("/en");
    await expect(
      publicPage.getByRole("heading", { name: "Integration test package" }),
    ).toBeVisible();
    await expect(publicPage.getByText("$800", { exact: true })).toBeVisible();
    await page
      .getByRole("button", { name: "Edit Integration test package" })
      .click();
    await page.getByLabel("Price (USD)").fill("950");
    await page.getByRole("button", { name: "Save item" }).click();
    await expect(page.getByRole("status")).toHaveText("Saved successfully.");
    await publicPage.reload();
    await expect(publicPage.getByText("$950", { exact: true })).toBeVisible();
    await page
      .getByRole("button", { name: "Site settings", exact: true })
      .click();
    await page
      .getByLabel("Instagram URL")
      .fill("https://www.instagram.com/targetwise_test/");
    await page.getByRole("button", { name: "Save settings" }).click();
    await expect(page.getByRole("status")).toHaveText("Saved successfully.");
    await publicPage.reload();
    await expect(
      publicPage.getByRole("link", { name: "Instagram" }),
    ).toHaveAttribute("href", "https://www.instagram.com/targetwise_test/");
    await page.screenshot({ path: "test-results/admin.png", fullPage: true });
    await page.getByRole("button", { name: "Packages", exact: true }).click();
    page.once("dialog", (d) => d.accept());
    await page
      .getByRole("button", { name: "Delete Integration test package" })
      .click();
    await expect(page.getByRole("status")).toHaveText("Deleted.");
    await publicPage.reload();
    await expect(
      publicPage.getByRole("heading", { name: "Integration test package" }),
    ).toHaveCount(0);
    await page.getByRole("button", { name: "Sign out", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Welcome back." }),
    ).toBeVisible();
  },
);
test("protected writes, origin enforcement, manifest and offline fallback", async ({
  page,
  request,
}) => {
  const noSession = await request.put("/api/admin/metrics", {
    headers: { Origin: "http://localhost:3100" },
    data: {},
  });
  expect(noSession.status()).toBe(401);
  const cross = await request.put("/api/admin/settings", {
    headers: { Origin: "https://evil.example" },
    data: {},
  });
  expect(cross.status()).toBe(403);
  const manifest = await request.get("/manifest.webmanifest");
  expect((await manifest.json()).icons).toHaveLength(3);
  await page.goto("/en");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.context().setOffline(true);
  await page.goto("/ar");
  await expect(
    page.getByRole("heading", { name: "You’re offline." }),
  ).toBeVisible();
  await page.context().setOffline(false);
});

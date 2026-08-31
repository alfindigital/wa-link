import { expect, test } from "@playwright/test";

const presetPayload = Buffer.from(
  JSON.stringify({
    phone: "081234567890",
    msg: "Halo dari preset",
  }),
  "utf-8",
).toString("base64");

test.describe("WAlinkQ launch smoke", () => {
  test("can generate a link and stores it in history", async ({ page }) => {
    await page.goto(`/#p=${presetPayload}`);

    const phoneInput = page.locator("#phone");
    const messageInput = page.locator("#message");
    const submitButton = page.getByRole("button", { name: "Buat Link" });

    await page.getByRole("button", { name: "Muat preset" }).click();
    await expect(phoneInput).toHaveValue("812 3456 7890");

    await messageInput.fill("Halo dari smoke test");
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    const resultInput = page.getByLabel("Link WhatsApp siap disalin");
    await expect(resultInput).toHaveValue(
      "https://wa.me/EXAMPLE_NUMBER?text=Halo%20dari%20smoke%20test",
    );

    await page.goto("/riwayat");
    await expect(page.getByText("EXAMPLE_NUMBER")).toBeVisible();
    await expect(page.getByText("Halo dari smoke test")).toBeVisible();
  });

  test("asks confirmation before applying preset links", async ({ page }) => {
    await page.goto(`/#p=${presetPayload}`);

    await expect(page.getByRole("heading", { name: "Muat preset dari link?" })).toBeVisible();
    await expect(page.getByText("Halo dari preset")).toBeVisible();

    await page.getByRole("button", { name: "Muat preset" }).click();
    await expect(page.locator("#phone")).toHaveValue("812 3456 7890");
    await expect(page.locator("#message")).toHaveValue("Halo dari preset");
  });

  test("publishes updated privacy and sitemap content", async ({ page }) => {
    await page.goto("/privasi");
    await expect(page.getByRole("heading", { name: "Privasi", exact: true })).toBeVisible();
    await expect(
      page.getByText("WAlinkQ dipublikasikan lewat platform hosting Lovable."),
    ).toBeVisible();
    await expect(page.getByText("Font dimuat dari server WAlinkQ")).toBeVisible();

    const sitemap = await page.request.get("/sitemap.xml");
    expect(sitemap.ok()).toBeTruthy();
    const xml = await sitemap.text();
    expect(xml).toContain("<loc>https://link-wa.alfindigital.com/</loc>");
    expect(xml).toContain("<loc>https://link-wa.alfindigital.com/pengaturan</loc>");
    expect(xml).toContain("<loc>https://link-wa.alfindigital.com/privasi</loc>");
  });
});


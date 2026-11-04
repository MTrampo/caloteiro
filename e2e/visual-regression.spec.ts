import { test, expect } from "@playwright/test";

/**
 * Testes de Regressão Visual e Consistência de Design System
 * Garante que nenhuma tela desalinhe, quebre a paleta de cores ou perca
 * a consistência visual do ecossistema do Tubarão (Desktop e Mobile).
 */
test.describe("Consistência Visual e Regressão de Telas (MVP Caloteiro)", () => {
  test("Página de Login (/entrar) - Snapshot Visual", async ({ page }) => {
    await page.goto("/entrar");
    await page.waitForLoadState("networkidle");

    // Valida se o formulário e a tipografia estão visíveis
    await expect(page.locator("h1, h2")).toBeVisible();
    await expect(page).toHaveScreenshot("login-page.png", {
      maxDiffPixelRatio: 0.05,
    });
  });

  test("Página de Documentação de Planos (/documentos/planos) - Snapshot Visual", async ({ page }) => {
    await page.goto("/documentos/planos");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveScreenshot("planos-doc-page.png", {
      maxDiffPixelRatio: 0.05,
    });
  });
});


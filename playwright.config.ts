import { defineConfig, devices } from "@playwright/test";

// Carrega as variáveis de ambiente do .env para os testes do Playwright
if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile();
  } catch {}
}

/**
 * Configuração Playwright para o Caloteiro MVP (v1)
 *
 * Foco primário: Garantir a blindagem visual e responsiva em 100% das telas
 * (Públicas e Painel Autenticado) a partir de 320px (iPhone 5 / Régua de Ouro).
 */
export default defineConfig({
  testDir: "./e2e",
  snapshotPathTemplate: "{testDir}/__snapshots__/{testFilePath}/{projectName}/{arg}{ext}",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    // 1. Setup de autenticação inicial para as telas do Painel
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },

    // 2. Dispositivos de teste (executados após o setup)
    {
      name: "Mobile 320px (iPhone 5 / Régua de Ouro)",
      dependencies: ["setup"],
      testIgnore: /auth\.setup\.ts/,
      use: {
        viewport: { width: 320, height: 568 },
        isMobile: true,
        hasTouch: true,
        defaultBrowserType: "chromium",
      },
    },
    {
      name: "Mobile 390px (iPhone 13)",
      dependencies: ["setup"],
      testIgnore: /auth\.setup\.ts/,
      use: {
        ...devices["iPhone 13"],
      },
    },
    {
      name: "Desktop Chrome (1440px)",
      dependencies: ["setup"],
      testIgnore: /auth\.setup\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});

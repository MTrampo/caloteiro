import { test, expect } from "@playwright/test";
import { expectNoHorizontalOverflow } from "./helpers/layout-guards";
import path from "path";

const authFile = path.join(__dirname, "../playwright/.auth/user.json");

test.describe("Blindagem de Layout do Painel Autenticado (Mobile-First)", () => {
  // Utiliza a sessão autenticada salva pelo auth.setup
  test.use({ storageState: authFile });

  test("Painel Principal (/painel) - Dashboard, KPIs e Promessas sem overflow horizontal", async ({
    page,
  }) => {
    await page.goto("/painel");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("h2, h1").first()).toBeVisible();
    await expectNoHorizontalOverflow(page);

    // Rola para o feed diário e promessas
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(300);
    await expectNoHorizontalOverflow(page);

    // Rola até o final
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
    await expectNoHorizontalOverflow(page);
  });

  test("Lista de Dívidas (/painel/dividas) - Filtros, cabeçalho e listagem de pendências", async ({
    page,
  }) => {
    await page.goto("/painel/dividas");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("h2, h1").first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("Detalhes da Dívida (/painel/dividas/[id]) - Título com badge lado a lado e parcelas", async ({
    page,
  }) => {
    // Dívida 'Ajuda Familiar' existente no banco de dados de teste
    await page.goto("/painel/dividas/e8786dc4-7224-452b-b484-746c7a3214b1");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("h2").first()).toBeVisible();

    // Valida que não há scroll horizontal em 320px
    await expectNoHorizontalOverflow(page);

    // Rola até a lista de parcelas e confere integridade
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(300);
    await expectNoHorizontalOverflow(page);
  });

  test("Stepper de Nova Dívida (/painel/dividas/nova) - Navegação passo a passo sem quebra", async ({
    page,
  }) => {
    await page.goto("/painel/dividas/nova");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("h2, h1").first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("Lista de Devedores (/painel/devedores) - Cards de presas marcadas e ações", async ({
    page,
  }) => {
    await page.goto("/painel/devedores");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("h2, h1").first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("Raio-X da Presa (/painel/devedores/[id]) - Perfil completo, score e mural de caôs", async ({
    page,
  }) => {
    // Devedor 'Cleiton Lopes' existente no banco
    await page.goto("/painel/devedores/8dd50fbd-19cf-4efd-9c23-a5ab88e23024");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("h2").first()).toBeVisible();
    await expectNoHorizontalOverflow(page);

    // Testa alternância das abas de histórico (Extrato, Promessas, Caôs)
    const tabCaos = page.locator('button:has-text("Mural de Caôs")').first();
    if (await tabCaos.isVisible()) {
      await tabCaos.click({ force: true });
      await page.waitForTimeout(300);
      await expectNoHorizontalOverflow(page);
    }
  });

  test("Novo Devedor (/painel/devedores/novo) - Formulário de cadastro de presa", async ({
    page,
  }) => {
    await page.goto("/painel/devedores/novo");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("h2, h1").first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("Central Financeira (/painel/financeiro) - Métricas, filtros e fluxo de caixa", async ({
    page,
  }) => {
    await page.goto("/painel/financeiro");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("h2, h1").first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("Termômetro de Risco (/painel/termometro) - Classificação e zonas de perigo", async ({
    page,
  }) => {
    await page.goto("/painel/termometro");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("h2, h1").first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("Gestão de Conta e Assinatura (/painel/conta e /painel/assinatura) - Dados e limites", async ({
    page,
  }) => {
    await page.goto("/painel/conta");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("h2, h1").first()).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.goto("/painel/assinatura");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("h2, h1").first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});

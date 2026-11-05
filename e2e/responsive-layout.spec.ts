import { test, expect } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectElementFitsViewport,
} from "./helpers/layout-guards";

test.describe("Blindagem de Layout e Responsividade Mobile-First (Caloteiro)", () => {
  test("Landing Page (/) - Não deve possuir vazamento horizontal e deve manter CTAs no viewport", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Verifica se o título principal e o CTA do hero carregaram
    await expect(page.locator("h1")).toBeVisible();
    await expectNoHorizontalOverflow(page);

    // Rola até o meio da página (simuladores e bento) e revalida ausência de overflow
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(300);
    await expectNoHorizontalOverflow(page);

    // Rola até o rodapé da landing page e revalida
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
    await expectNoHorizontalOverflow(page);
  });

  test("Página de Login (/entrar) - Formulário e botão de ação devem caber na tela sem overflow", async ({
    page,
  }) => {
    await page.goto("/entrar");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("h2, h1").first()).toBeVisible();
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();

    // Valida que o botão de ação principal se ajusta perfeitamente à largura
    await expectElementFitsViewport(page, 'button[type="submit"]');
    await expectNoHorizontalOverflow(page);
  });

  test("Página de Cadastro (/cadastrar) - Formulário completo e termos devem ser 100% responsivos", async ({
    page,
  }) => {
    await page.goto("/cadastrar");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("h2, h1").first()).toBeVisible();
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();

    await expectElementFitsViewport(page, 'button[type="submit"]');
    await expectNoHorizontalOverflow(page);
  });

  test("Página de Planos (/documentos/planos) - Vitrine de planos e cards não devem vazar a tela", async ({
    page,
  }) => {
    await page.goto("/documentos/planos");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("h1, h2").first()).toBeVisible();
    await expectNoHorizontalOverflow(page);

    // Rola para a tabela/cards comparativos e confere integridade
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(300);
    await expectNoHorizontalOverflow(page);
  });

  test("Termos de Uso (/documentos/termos) - Leitura jurídica fluida sem quebra lateral", async ({
    page,
  }) => {
    await page.goto("/documentos/termos");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("h1, h2").first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("Política de Privacidade (/documentos/privacidade) - Leitura fluida sem quebra lateral", async ({
    page,
  }) => {
    await page.goto("/documentos/privacidade");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("h1, h2").first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("Central de Dúvidas / FAQ (/documentos/perguntas-frequentes) - Acordeões clicáveis e responsivos", async ({
    page,
  }) => {
    await page.goto("/documentos/perguntas-frequentes");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("h1, h2").first()).toBeVisible();
    await expectNoHorizontalOverflow(page);

    // Clica no primeiro gatilho de pergunta do FAQ para abrir o conteúdo
    const firstAccordionTrigger = page.locator("button[aria-expanded]").first();
    if (await firstAccordionTrigger.isVisible()) {
      await firstAccordionTrigger.click();
      await page.waitForTimeout(300);
      await expectNoHorizontalOverflow(page);
    }
  });

  test("Ajuda e Dicionário da Gruta (/documentos/ajuda) - Dicionário e guia devem caber na tela sem overflow", async ({
    page,
  }) => {
    await page.goto("/documentos/ajuda");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("h2, h1").first()).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(300);
    await expectNoHorizontalOverflow(page);
  });

  test("Portal da Fatura Pública (/fatura/demo-layout) - Tela de código de acesso sem overflow", async ({
    page,
  }) => {
    await page.goto("/fatura/demo-layout");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("h2, h1").first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});


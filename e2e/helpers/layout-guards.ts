import { expect, type Page } from "@playwright/test";

/**
 * Validação rigorosa de ausência de overflow horizontal (anti-vazamento de tela).
 *
 * 80% dos usuários do Caloteiro acessam via mobile. Vazamentos horizontais
 * (onde a página desliza lateralmente) destroem a experiência e quebram botões.
 * Esta função inspeciona o DOM e aponta os elementos exatos que estiverem transbordando
 * sem estarem contidos em um contêiner com overflow: hidden (como carrosséis legítimos).
 */
export async function expectNoHorizontalOverflow(page: Page) {
  const overflowInfo = await page.evaluate(() => {
    const docWidth = document.documentElement.clientWidth;
    const scrollWidth = document.documentElement.scrollWidth;
    const bodyScrollWidth = document.body ? document.body.scrollWidth : 0;

    const overflowingElements: Array<{
      tag: string;
      id: string;
      className: string;
      right: number;
      docWidth: number;
    }> = [];

    // Função para verificar se um elemento está seguramente contido em um ancestral com overflow-hidden
    function isClippedByAncestor(el: Element, maxRight: number): boolean {
      let current = el.parentElement;
      while (current && current !== document.body && current !== document.documentElement) {
        const style = window.getComputedStyle(current);
        const isHidden =
          style.overflowX === "hidden" ||
          style.overflowX === "clip" ||
          style.overflow === "hidden" ||
          style.overflow === "clip";

        if (isHidden) {
          const parentRect = current.getBoundingClientRect();
          if (parentRect.right <= maxRight + 2) {
            return true;
          }
        }
        current = current.parentElement;
      }
      return false;
    }

    if (scrollWidth > docWidth + 1 || bodyScrollWidth > docWidth + 1) {
      const allElements = document.querySelectorAll("*");
      for (const el of allElements) {
        if (
          ["script", "style", "meta", "link", "noscript"].includes(
            el.tagName.toLowerCase()
          )
        ) {
          continue;
        }

        const rect = el.getBoundingClientRect();
        if (rect.right > docWidth + 2 && !isClippedByAncestor(el, docWidth)) {
          overflowingElements.push({
            tag: el.tagName.toLowerCase(),
            id: el.id,
            className:
              typeof el.className === "string" ? el.className.slice(0, 100) : "",
            right: Math.round(rect.right),
            docWidth,
          });
        }
      }
    }

    return {
      docWidth,
      scrollWidth,
      bodyScrollWidth,
      hasOverflow: scrollWidth > docWidth + 1 || bodyScrollWidth > docWidth + 1,
      overflowingElements: overflowingElements.slice(0, 5),
    };
  });

  expect(
    overflowInfo.hasOverflow,
    `Vazamento horizontal detectado! Viewport: ${overflowInfo.docWidth}px | ScrollWidth: ${overflowInfo.scrollWidth}px.\nElementos com vazamento:\n${JSON.stringify(
      overflowInfo.overflowingElements,
      null,
      2
    )}`
  ).toBe(false);
}

/**
 * Garante que um elemento crítico esteja visível e totalmente contido na tela.
 */
export async function expectElementFitsViewport(page: Page, selector: string) {
  const fits = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return { found: false, fits: false };
    const rect = el.getBoundingClientRect();
    const docWidth = document.documentElement.clientWidth;
    return {
      found: true,
      fits: rect.left >= 0 && rect.right <= docWidth + 2,
      left: Math.round(rect.left),
      right: Math.round(rect.right),
      docWidth,
    };
  }, selector);

  expect(fits.found, `Elemento não encontrado no DOM: ${selector}`).toBe(true);
  expect(
    fits.fits,
    `Elemento ${selector} ultrapassou a largura da tela! Left: ${fits.left}px, Right: ${fits.right}px, Viewport: ${fits.docWidth}px`
  ).toBe(true);
}

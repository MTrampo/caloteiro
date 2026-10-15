import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

/**
 * Suíte de Testes de Consistência Visual e Conformidade com as Diretrizes
 * Garante que o sistema nunca pareça "um em uma página e outro em outra página".
 */
describe("Conformidade de Design System e Consistência Visual", () => {
  const featuresDir = path.resolve(process.cwd(), "src/features");

  const getFilesRecursively = (dir: string, extension = ".tsx"): string[] => {
    let results: string[] = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(getFilesRecursively(fullPath, extension));
      } else if (file.endsWith(extension)) {
        results.push(fullPath);
      }
    }
    return results;
  };

  it("deve proibir o uso de bordas pontilhadas (border-dashed) em empty states de features", () => {
    const featureFiles = getFilesRecursively(featuresDir);
    const violations: { file: string; line: number }[] = [];

    for (const filePath of featureFiles) {
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n");
      lines.forEach((line, index) => {
        // Ignora comentários
        if (line.trim().startsWith("//") || line.trim().startsWith("/*")) return;
        if (line.includes("border-dashed") && !filePath.includes("ui/")) {
          violations.push({ file: path.basename(filePath), line: index + 1 });
        }
      });
    }

    expect(
      violations,
      `Bordas pontilhadas (border-dashed) são proibidas em empty states segundo a Diretriz 4B: ${JSON.stringify(
        violations
      )}`
    ).toHaveLength(0);
  });

  it("deve proibir o uso do termo obsoleto 'figurinhas' no glossário de clientes/devedores", () => {
    const featureFiles = getFilesRecursively(featuresDir);
    const violations: { file: string; line: number }[] = [];

    for (const filePath of featureFiles) {
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n");
      lines.forEach((line, index) => {
        if (line.trim().startsWith("//") || line.trim().startsWith("/*")) return;
        // Termo proibido segundo o Glossário Caloteiro (Seção 3)
        if (line.toLowerCase().includes("figurinhas")) {
          violations.push({ file: path.basename(filePath), line: index + 1 });
        }
      });
    }

    expect(
      violations,
      `O termo 'figurinhas' é proibido pelas diretrizes de UX (usar Devedores/Suspeitos/Presas): ${JSON.stringify(
        violations
      )}`
    ).toHaveLength(0);
  });

  it("deve garantir que as páginas principais do painel respeitam o container raiz unificado", () => {
    const mainFeatures = [
      path.join(featuresDir, "home-command/index.tsx"),
      path.join(featuresDir, "subscription/subscription-page-feature.tsx"),
      path.join(featuresDir, "settings/index.tsx"),
    ];

    for (const featureFile of mainFeatures) {
      if (fs.existsSync(featureFile)) {
        const content = fs.readFileSync(featureFile, "utf-8");
        // Verifica se inclui o padrão de layout flex-1 p-4 sm:p-6 space-y-6 w-full
        expect(
          content.includes("flex-1 p-4 sm:p-6 space-y-6 w-full"),
          `Arquivo ${path.basename(featureFile)} deve utilizar a classe de container raiz unificada 'flex-1 p-4 sm:p-6 space-y-6 w-full'`
        ).toBe(true);
      }
    }
  });
});


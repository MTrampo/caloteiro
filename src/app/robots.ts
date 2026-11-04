import type { MetadataRoute } from "next";
import { APP_URL } from "@/commons/constants/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/documentos",
        "/documentos/planos",
        "/documentos/termos",
        "/documentos/privacidade",
        "/cadastrar",
        "/entrar",
        "/llms.txt",
        "/llms-full.txt",
      ],
      disallow: [
        "/fatura/",
        "/painel/",
        "/api/",
        "/assinatura/sucesso",
      ],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}


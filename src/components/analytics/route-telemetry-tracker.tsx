"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { trackFeatureView, trackEvent } from "@/commons/utils/analytics";

function resolveFeatureKey(pathname: string): { key: string; isPanel: boolean } {
  if (pathname === "/") return { key: "landing_home", isPanel: false };
  if (pathname === "/cadastrar") return { key: "auth_cadastrar", isPanel: false };
  if (pathname === "/entrar") return { key: "auth_entrar", isPanel: false };
  if (pathname === "/assinatura") return { key: "checkout_assinatura", isPanel: false };
  if (pathname === "/assinatura/sucesso") return { key: "checkout_sucesso", isPanel: false };

  // Documentos legais
  if (pathname.startsWith("/documentos")) {
    if (pathname === "/documentos/termos") return { key: "legal_termos", isPanel: false };
    if (pathname === "/documentos/privacidade") return { key: "legal_privacidade", isPanel: false };
    if (pathname === "/documentos/planos") return { key: "legal_planos", isPanel: false };
    return { key: "legal_hub", isPanel: false };
  }

  // Área logada do Painel do Tubarão
  if (pathname.startsWith("/painel")) {
    if (pathname === "/painel") return { key: "painel_visao_geral", isPanel: true };
    if (pathname === "/painel/dividas") return { key: "painel_dividas_lista", isPanel: true };
    if (pathname === "/painel/dividas/nova") return { key: "painel_dividas_nova", isPanel: true };
    if (pathname === "/painel/dividas/acompanhamento") return { key: "painel_dividas_acompanhamento", isPanel: true };
    if (pathname.startsWith("/painel/dividas/")) return { key: "painel_dividas_detalhe", isPanel: true };
    if (pathname === "/painel/devedores") return { key: "painel_devedores_lista", isPanel: true };
    if (pathname === "/painel/devedores/novo") return { key: "painel_devedores_novo", isPanel: true };
    if (pathname.startsWith("/painel/devedores/")) return { key: "painel_devedores_detalhe", isPanel: true };
    if (pathname === "/painel/termometro") return { key: "painel_termometro_risco", isPanel: true };
    if (pathname === "/painel/financeiro") return { key: "painel_financeiro_auditoria", isPanel: true };
    if (pathname === "/painel/assinatura") return { key: "painel_assinatura_gestao", isPanel: true };
    if (pathname === "/painel/configuracoes") return { key: "painel_configuracoes_pix", isPanel: true };
    if (pathname.startsWith("/painel/conta")) return { key: "painel_conta_perfil", isPanel: true };
    return { key: "painel_outros", isPanel: true };
  }

  return { key: "outros", isPanel: false };
}

export function RouteTelemetryTracker() {
  const pathname = usePathname();
  const lastPathRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!pathname || lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;

    const { key, isPanel } = resolveFeatureKey(pathname);

    // Registra view da funcionalidade para entender uso
    trackFeatureView(key, pathname);

    // Se for visita a documentos legais, registra evento explícito
    if (pathname.startsWith("/documentos")) {
      const docSlug = pathname.replace("/documentos", "").replace("/", "") || "hub";
      trackEvent("view_legal_document", {
        document_slug: docSlug,
        pathname,
      });
    }

    // Se estiver na tela de sucesso de assinatura, registra conversão
    if (pathname === "/assinatura/sucesso") {
      trackEvent("subscription_success", {
        pathname,
      });
    }
  }, [pathname]);

  return null;
}


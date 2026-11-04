"use client";

import * as React from "react";
import Link from "next/link";
import { FaCookieBite, FaXmark } from "react-icons/fa6";
import { Button } from "@/components/ui/button";

const COOKIE_CONSENT_KEY = "caloteiro_cookie_consent";

const subscribe = (callback: () => void) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

const getClientSnapshot = () => {
  try {
    return localStorage.getItem(COOKIE_CONSENT_KEY) ?? "";
  } catch {
    return "acknowledged";
  }
};

const getServerSnapshot = () => "acknowledged";

export function CookieConsentBanner() {
  const [isDismissed, setIsDismissed] = React.useState(false);

  const consentStatus = React.useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  const handleDismiss = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, "acknowledged");
    } catch {}
    setIsDismissed(true);
  };

  const isVisible = consentStatus !== "acknowledged" && !isDismissed;

  if (!isVisible) {
    return null;
  }

  return (
    <aside
      aria-label="Aviso de Cookies e Privacidade"
      className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:max-w-lg z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-xl p-4 sm:p-5 shadow-2xl space-y-3.5 text-zinc-100">
        {/* Topo do Banner: Ícone + Título + Fechar rápido */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <FaCookieBite className="size-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-heading text-sm font-bold text-white tracking-tight">
                Aviso de Privacidade e Cookies
              </h3>
              <span className="text-[10px] font-mono text-zinc-500 block">
                Transparência LGPD • Zero rastreamento de IP
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            title="Fechar aviso"
            aria-label="Fechar aviso de cookies"
            className="size-7 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <FaXmark className="size-3.5" />
          </button>
        </div>

        {/* Mensagem Explicativa */}
        <p className="text-xs font-mono text-zinc-300 leading-relaxed">
          Ao navegar ou criar sua conta no Caloteiro, você concorda com o uso de cookies essenciais de sessão e telemetria agregada anônima para
          aprimoramento da plataforma. <strong className="text-white">Não coletamos e não armazenamos seu endereço IP</strong> nem dados técnicos
          de navegação. Sua <strong className="text-white">identidade</strong> e <strong className="text-white">cobranças</strong> permanecem em absoluto sigilo.
        </p>

        {/* Link para Política + Botão Único Informativo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-zinc-800/80">
          <Link
            href="/documentos/privacidade"
            className="text-[11px] font-mono text-zinc-400 hover:text-emerald-400 underline decoration-zinc-700 hover:decoration-emerald-400 transition-colors self-start sm:self-auto"
          >
            Ver Política de Privacidade
          </Link>

          <Button
            type="button"
            size="sm"
            onClick={handleDismiss}
            className="h-8 px-5 text-xs font-heading font-bold bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl cursor-pointer shadow-xs w-full sm:w-auto shrink-0"
          >
            Entendido
          </Button>
        </div>
      </div>
    </aside>
  );
}


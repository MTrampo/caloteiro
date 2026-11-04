"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WifiOff, RefreshCw } from "lucide-react";

/**
 * Banner fixo no topo exibido quando o Tubarão perde o sinal de internet.
 * Ativa o modo de conferência offline sem bloquear a visualização das páginas já visitadas.
 * Projetado e testado rigorosamente para mobile a partir de 320px (iPhone 5).
 */
export function OfflineStatusBanner() {
  const router = useRouter();
  const [isOffline, setIsOffline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      setWasOffline(true);
    };

    const handleOnline = () => {
      setIsOffline(false);
      // Se estava offline e recuperou o sinal, sincroniza silenciosamente com o servidor
      if (wasOffline) {
        setWasOffline(false);
        router.refresh();
      }
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [wasOffline, router]);

  if (!isOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-0 z-50 w-full bg-amber-950/95 border-b border-amber-500/40 text-amber-100 backdrop-blur-md px-3 py-2 sm:px-4 sm:py-2.5 transition-all animate-in fade-in slide-in-from-top duration-300"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 max-w-7xl mx-auto">
        <div className="flex items-start sm:items-center gap-2">
          <WifiOff className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-xs sm:text-sm font-medium leading-tight">
            <span className="font-bold text-amber-300">Sem sinal no mar!</span> Modo de conferência offline ativo.
            <span className="hidden sm:inline"> Exibindo últimos dados sincronizados da sua gruta.</span>
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-0.5 sm:pt-0">
          <span className="text-[11px] text-amber-300/80 font-mono">
            Ações de baixa e edição bloqueadas offline
          </span>
          <button
            type="button"
            onClick={() => {
              if (window.navigator.onLine) {
                setIsOffline(false);
                router.refresh();
              }
            }}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-200 hover:text-white bg-amber-900/60 hover:bg-amber-900 border border-amber-500/30 rounded-md px-2 py-1 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="whitespace-nowrap">Reconectar</span>
          </button>
        </div>
      </div>
    </div>
  );
}


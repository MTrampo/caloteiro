"use client";

import * as React from "react";
import Image from "next/image";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { IosGuideDialog } from "./ios-guide-dialog";
import {
  FaDownload,
  FaXmark,
  FaMobileScreen,
  FaLaptop,
} from "react-icons/fa6";

export function InstallBanner() {
  const {
    canInstall,
    isIOS,
    isDesktop,
    installDescription,
    installApp,
    dismissBanner,
  } = usePwaInstall();
  const [showIosGuide, setShowIosGuide] = React.useState(false);

  if (!canInstall) {
    return null;
  }

  const handleAction = async () => {
    if (isIOS) {
      setShowIosGuide(true);
    } else {
      await installApp();
    }
  };

  return (
    <>
      <aside
        aria-label="Instalação do Aplicativo Caloteiro"
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-45 animate-in fade-in slide-in-from-bottom-5 duration-300"
      >
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/95 p-3.5 sm:p-4 shadow-2xl backdrop-blur-xl text-zinc-100">
          {/* Ícone Oficial do Tubarão */}
          <div className="relative flex size-11 shrink-0 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-700/80 overflow-hidden p-1.5 shadow-inner">
            <Image
              src="/apple-touch-icon.png"
              alt="Caloteiro"
              width={36}
              height={36}
              priority
              className="size-full object-contain"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-heading font-bold text-xs sm:text-sm text-white truncate">
                {isDesktop
                  ? "Caloteiro no seu computador"
                  : "Caloteiro no seu celular"}
              </span>
              {isDesktop ? (
                <FaLaptop className="size-3 text-emerald-400 shrink-0" />
              ) : (
                <FaMobileScreen className="size-3 text-emerald-400 shrink-0" />
              )}
            </div>
            <p className="text-[11px] font-mono text-zinc-400 truncate mt-0.5">
              {installDescription}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleAction}
              className="inline-flex items-center justify-center h-9 px-3.5 gap-1.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-heading font-bold text-xs cursor-pointer shadow-sm transition-colors active:translate-y-px"
            >
              <FaDownload className="size-3 shrink-0" />
              <span className="hidden xs:inline">Instalar</span>
            </button>

            <button
              type="button"
              onClick={dismissBanner}
              className="flex size-8 items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors cursor-pointer"
              aria-label="Fechar aviso de instalação"
            >
              <FaXmark className="size-3.5" />
            </button>
          </div>
        </div>
      </aside>

      <IosGuideDialog open={showIosGuide} onOpenChange={setShowIosGuide} />
    </>
  );
}

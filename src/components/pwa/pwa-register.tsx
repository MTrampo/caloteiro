"use client";

import * as React from "react";
import { toast } from "sonner";
import { registerPwaServiceWorker } from "@/commons/utils/pwa";

export function PwaRegister() {
  React.useEffect(() => {
    registerPwaServiceWorker();

    const handleUpdateAvailable = () => {
      toast("Nova versão da Gruta disponível!", {
        description: "Toque para recarregar e acessar as melhorias mais recentes.",
        action: {
          label: "Atualizar Gruta",
          onClick: () => {
            if ("serviceWorker" in navigator) {
              navigator.serviceWorker.getRegistration().then((reg) => {
                if (reg?.waiting) {
                  reg.waiting.postMessage({ type: "SKIP_WAITING" });
                }
                window.location.reload();
              });
            } else {
              window.location.reload();
            }
          },
        },
        duration: 8000,
      });
    };

    window.addEventListener("pwa-update-available", handleUpdateAvailable);

    return () => {
      window.removeEventListener("pwa-update-available", handleUpdateAvailable);
    };
  }, []);

  return null;
}

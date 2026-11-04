"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { trackLegalReading } from "@/commons/utils/analytics";

export function LegalDocReadingTracker() {
  const pathname = usePathname();
  const startTimeRef = React.useRef<number>(0);
  const milestone50Ref = React.useRef<boolean>(false);
  const milestone90Ref = React.useRef<boolean>(false);

  // Reinicia marcos ao trocar de documento
  React.useEffect(() => {
    startTimeRef.current = Date.now();
    milestone50Ref.current = false;
    milestone90Ref.current = false;
  }, [pathname]);

  React.useEffect(() => {
    const docSlug = pathname.replace("/documentos", "").replace("/", "") || "hub";

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;

      const currentScroll = window.scrollY;
      const scrollPercent = Math.round((currentScroll / scrollHeight) * 100);
      const timeSpentSec = Math.round((Date.now() - startTimeRef.current) / 1000);

      // Marco de 50% de rolagem
      if (scrollPercent >= 50 && !milestone50Ref.current) {
        milestone50Ref.current = true;
        trackLegalReading(docSlug, 50, timeSpentSec);
      }

      // Marco de 90% de rolagem (leitura completa)
      if (scrollPercent >= 90 && !milestone90Ref.current) {
        milestone90Ref.current = true;
        trackLegalReading(docSlug, 90, timeSpentSec);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  return null;
}


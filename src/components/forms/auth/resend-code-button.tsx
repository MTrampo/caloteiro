"use client";

import * as React from "react";
import { FaRotateRight } from "react-icons/fa6";
import { Loader2 } from "lucide-react";

interface ResendCodeButtonProps {
  onResend: () => Promise<void> | void;
  initialSeconds?: number; // Padrão: 300 segundos (5 minutos)
  storageKey?: string; // Chave para persistir o timer no sessionStorage
  className?: string;
}

function formatMinutesSeconds(totalSeconds: number): string {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function ResendCodeButton({
  onResend,
  initialSeconds = 300,
  storageKey,
  className = "",
}: ResendCodeButtonProps) {
  const [timeLeft, setTimeLeft] = React.useState(initialSeconds);
  const [isPending, startTransition] = React.useTransition();

  const resetTargetInStorage = React.useCallback(() => {
    if (!storageKey || typeof window === "undefined") return;
    try {
      const targetTime = Date.now() + initialSeconds * 1000;
      sessionStorage.setItem(storageKey, String(targetTime));
    } catch {}
  }, [storageKey, initialSeconds]);

  React.useEffect(() => {
    const syncWithStorage = () => {
      if (!storageKey || typeof window === "undefined") {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        return;
      }

      try {
        const stored = sessionStorage.getItem(storageKey);
        if (!stored) {
          const target = Date.now() + initialSeconds * 1000;
          sessionStorage.setItem(storageKey, String(target));
          setTimeLeft(initialSeconds);
          return;
        }

        const remaining = Math.ceil((Number(stored) - Date.now()) / 1000);
        setTimeLeft(remaining > 0 ? remaining : 0);
      } catch {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }
    };

    // Sincronização inicial assíncrona para evitar cascading renders no React 19
    const initialTimeout = setTimeout(syncWithStorage, 0);
    const interval = setInterval(syncWithStorage, 1000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [storageKey, initialSeconds]);

  const handleResendClick = () => {
    if (timeLeft > 0 || isPending) return;

    startTransition(async () => {
      await onResend();
      resetTargetInStorage();
      setTimeLeft(initialSeconds);
    });
  };

  const isCountingDown = timeLeft > 0;

  return (
    <button
      type="button"
      onClick={handleResendClick}
      disabled={isCountingDown || isPending}
      className={`inline-flex items-center gap-1.5 text-xs font-mono transition-colors cursor-pointer select-none ${
        isCountingDown || isPending
          ? "text-zinc-500 opacity-60 cursor-not-allowed"
          : "text-zinc-400 hover:text-emerald-400"
      } ${className}`}
    >
      {isPending ? (
        <Loader2 className="size-3 animate-spin text-emerald-400" />
      ) : (
        <FaRotateRight className={`size-3 ${isCountingDown ? "opacity-70" : ""}`} />
      )}
      <span>
        {isPending
          ? "Reenviando..."
          : isCountingDown
          ? `Reenviar código em ${formatMinutesSeconds(timeLeft)}`
          : "Reenviar código"}
      </span>
    </button>
  );
}


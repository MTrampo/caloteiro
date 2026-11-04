import * as React from "react";
import type { SharkMeta } from "../types";

export function getSharkMeta(slug: string): SharkMeta {
  switch (slug) {
    case "tubarao-lixa":
      return {
        level: 1,
        label: "Manso",
        badgeClass: "text-sky-400 border-sky-500/30 bg-sky-500/10",
        barClass: "bg-sky-400",
        borderClass: "border-zinc-800/80 hover:border-sky-500/40",
        iconColorClass: "text-sky-400",
      };
    case "tubarao-branco":
      return {
        level: 2,
        label: "Na Espreita",
        badgeClass: "text-emerald-400 border-emerald-500/40 bg-emerald-500/15 shadow-sm shadow-emerald-950/50",
        barClass: "bg-emerald-400",
        borderClass: "border-zinc-800/80 hover:border-emerald-500/40",
        iconColorClass: "text-emerald-400",
      };
    case "tubarao-cabeca-chato":
      return {
        level: 3,
        label: "Letal",
        badgeClass: "text-rose-400 border-rose-500/30 bg-rose-500/10",
        barClass: "bg-rose-500",
        borderClass: "border-zinc-800/80 hover:border-rose-500/40",
        iconColorClass: "text-rose-400",
      };
    default:
      return {
        level: 1,
        label: "Vigilante",
        badgeClass: "text-zinc-400 border-zinc-700 bg-zinc-800/50",
        barClass: "bg-zinc-400",
        borderClass: "border-zinc-800/80",
        iconColorClass: "text-zinc-400",
      };
  }
}

export function getPlanBadgeClass(slug: string): string {
  if (slug === "tubarao-branco") {
    return "bg-emerald-500 text-zinc-950 border-emerald-400 shadow-sm shadow-emerald-950/50";
  }
  if (slug === "tubarao-cabeca-chato") {
    return "bg-rose-600 text-white border-rose-500 shadow-sm shadow-rose-950/50";
  }
  return "bg-zinc-800 text-zinc-300 border-zinc-700";
}

export function renderSharkQuote(sharkText: string): React.ReactNode {
  const parts = sharkText.split(":");
  if (parts.length > 1) {
    const species = parts[0].trim();
    const quote = parts.slice(1).join(":").trim();
    return (
      <p className="text-[11px] font-mono leading-relaxed text-zinc-300">
        <span className="text-white font-semibold not-italic">{species}:</span>{" "}
        <span className="italic text-zinc-300">&ldquo;{quote}&rdquo;</span>
      </p>
    );
  }

  return (
    <p className="text-[11px] font-mono leading-relaxed italic text-zinc-300">
      &ldquo;{sharkText}&rdquo;
    </p>
  );
}


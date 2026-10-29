import { Target } from "lucide-react";
import type { SharkBehaviorBoxProps } from "../types";
import { getSharkMeta, renderSharkQuote } from "../utils/shark-meta";

export function SharkBehaviorBox({ slug, sharkText }: SharkBehaviorBoxProps) {
  const meta = getSharkMeta(slug);

  return (
    <div
      className={`rounded-xl bg-zinc-950/80 border p-3.5 flex flex-col justify-between min-h-[112px] transition-all duration-200 ${meta.borderClass}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 border-b border-zinc-800/70 pb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Target className={`size-3.5 shrink-0 ${meta.iconColorClass}`} />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-300">
            Comportamento
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
          <div
            className="flex items-center gap-1"
            title={`Nível ${meta.level} de 3 — ${meta.label}`}
          >
            <span
              className={`h-1.5 w-2 rounded-full transition-colors ${
                meta.level >= 1 ? meta.barClass : "bg-zinc-800"
              }`}
            />
            <span
              className={`h-1.5 w-2 rounded-full transition-colors ${
                meta.level >= 2 ? meta.barClass : "bg-zinc-800"
              }`}
            />
            <span
              className={`h-1.5 w-2 rounded-full transition-colors ${
                meta.level >= 3 ? meta.barClass : "bg-zinc-800"
              }`}
            />
          </div>
          <span
            className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border whitespace-nowrap ${meta.badgeClass}`}
          >
            {meta.label}
          </span>
        </div>
      </div>

      <div className="pt-2">
        {renderSharkQuote(sharkText)}
      </div>
    </div>
  );
}


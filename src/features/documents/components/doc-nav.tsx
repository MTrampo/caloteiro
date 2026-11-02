"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/commons/lib/utils";

const DOC_LINKS = [
  {
    href: "/documentos/planos",
    label: "Planos & Regras",
  },
  {
    href: "/documentos/perguntas-frequentes",
    label: "Dúvidas & Guia Legal",
  },
  {
    href: "/documentos/termos",
    label: "Termos de Uso",
  },
  {
    href: "/documentos/privacidade",
    label: "Política de Privacidade",
  },
];

export function DocNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1">
      {DOC_LINKS.map((link) => {
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap shrink-0",
              isActive
                ? "bg-zinc-800 text-white font-bold border border-zinc-700 shadow-xs"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}


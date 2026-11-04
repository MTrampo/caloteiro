"use client";

import * as React from "react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { FaChevronDown } from "react-icons/fa6";
import { cn } from "@/commons/lib/utils";

export interface DocFaqItem {
  id?: string;
  question: string;
  answer: string | React.ReactNode;
}

export interface DocFaqCollapsibleProps {
  items: DocFaqItem[];
  defaultOpenIndex?: number;
  className?: string;
}

export function DocFaqCollapsible({
  items,
  defaultOpenIndex = 0,
  className,
}: DocFaqCollapsibleProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(
    defaultOpenIndex
  );

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;

        return (
          <Collapsible
            key={item.id || idx}
            open={isOpen}
            onOpenChange={(nextOpen) => setOpenIndex(nextOpen ? idx : null)}
            className="rounded-2xl border border-border bg-card overflow-hidden transition-colors"
          >
            <CollapsibleTrigger className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer hover:bg-zinc-900/50 transition-colors">
              <span className="font-heading text-sm sm:text-base font-bold text-white">
                {item.question}
              </span>
              <FaChevronDown
                className={cn(
                  "size-3.5 text-zinc-400 shrink-0 transition-transform duration-200",
                  isOpen && "rotate-180 text-white"
                )}
              />
            </CollapsibleTrigger>

            <CollapsibleContent className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 text-xs sm:text-sm font-mono text-zinc-400 leading-relaxed border-t border-zinc-800/60">
              {item.answer}
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}


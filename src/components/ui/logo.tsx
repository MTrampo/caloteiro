import Image from "next/image";
import { cn } from "@/commons/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

const sizeMap = {
  sm: {
    container: "size-9 rounded-xl",
    width: 36,
    height: 36,
    title: "text-sm",
    subtitle: "text-[11px]",
  },
  md: {
    container: "size-10 rounded-xl",
    width: 40,
    height: 40,
    title: "text-base",
    subtitle: "text-xs",
  },
  lg: {
    container: "size-14 rounded-2xl",
    width: 56,
    height: 56,
    title: "text-xl",
    subtitle: "text-xs",
  },
  xl: {
    container: "size-20 rounded-3xl",
    width: 80,
    height: 80,
    title: "text-2xl",
    subtitle: "text-sm",
  },
};

export function Logo({ className, size = "md", showText = false }: LogoProps) {
  const current = sizeMap[size];

  return (
    <div className={cn("inline-flex items-center gap-3 select-none", className)}>
      <div
        className={cn(
          current.container,
          "relative flex items-center justify-center shrink-0 bg-zinc-900 border border-zinc-800 p-1.5 shadow-lg shadow-black/50 overflow-hidden"
        )}
      >
        <Image
          src="/logo.svg"
          alt="Caloteiro Logo"
          width={current.width}
          height={current.height}
          className="object-contain w-full h-full drop-shadow-sm"
          priority
        />
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={cn(current.title, "font-heading font-black tracking-wider text-white")}>
            CALOTEIRO
          </span>
          <span className={cn(current.subtitle, "font-mono text-zinc-400 font-medium")}>
            Central de Cobranças
          </span>
        </div>
      )}
    </div>
  );
}


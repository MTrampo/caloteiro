import { PromiseGravity } from "@/features/dashboard/components/promises-list/types";
import { IconType } from "react-icons";
import { FaBan, FaCircleCheck, FaClock, FaTriangleExclamation } from "react-icons/fa6";

export type GravityConfig = {
  label: string;
  icon: IconType;
  badgeClass: string;
  progressColor: string;
  borderHover: string;
  leftBorder: string;
  cardBg?: string;
};

export const GRAVITY_CONFIGS: Record<PromiseGravity, GravityConfig> = {
  ON_TIME: {
    label: "Milagre em Dia",
    icon: FaCircleCheck,
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    progressColor: "bg-emerald-400",
    borderHover: "hover:border-zinc-700",
    leftBorder: "border-l-4 border-l-emerald-500",
    cardBg: "",
  },
  LIGHT_DELAY: {
    label: "Sumido Recente",
    icon: FaClock,
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    progressColor: "bg-amber-400",
    borderHover: "hover:border-zinc-700",
    leftBorder: "border-l-4 border-l-amber-500",
    cardBg: "",
  },
  STANDARD_EXCUSE: {
    label: "Desculpa Padrão",
    icon: FaTriangleExclamation,
    badgeClass: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    progressColor: "bg-orange-400",
    borderHover: "hover:border-zinc-700",
    leftBorder: "border-l-4 border-l-orange-500",
    cardBg: "bg-orange-500/[0.02]",
  },
  BROKEN_AGREEMENT: {
    label: "Acordo Rompido",
    icon: FaBan,
    badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    progressColor: "bg-rose-500",
    borderHover: "hover:border-rose-500/50",
    leftBorder: "border-l-4 border-l-rose-500",
    cardBg: "bg-rose-500/[0.04]",
  },
};

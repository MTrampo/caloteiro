import { PromiseGravity, PromiseItem } from "@/features/dashboard/components/promises-list/types";
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

export const DEFAULT_PROMISES: PromiseItem[] = [
  {
    id: "prom-1",
    debtorId: "deb-1",
    debtorName: "Cleide Silva",
    debtTitle: "Acordo Formal",
    paidInstallments: 12,
    totalInstallments: 24,
    dueStatusText: "Venceu há 14 dias",
    gravity: "LIGHT_DELAY",
    url: "/painel/dividas/prom-1",
  },
  {
    id: "prom-2",
    debtorId: "deb-2",
    debtorName: "Cleiton Lopes",
    debtTitle: "Empréstimo Pessoal",
    paidInstallments: 3,
    totalInstallments: 6,
    dueStatusText: "Vence em 3 dias",
    gravity: "ON_TIME",
    url: "/painel/dividas/prom-2",
  },
  {
    id: "prom-3",
    debtorId: "deb-3",
    debtorName: "Karen Cristina",
    debtTitle: "Dívida Direta",
    paidInstallments: 1,
    totalInstallments: 12,
    dueStatusText: "3 parcelas acumuladas",
    gravity: "BROKEN_AGREEMENT",
    url: "/painel/dividas/prom-3",
  },
  {
    id: "prom-4",
    debtorId: "deb-4",
    debtorName: "Beto Oliveira",
    debtTitle: "Reforma da Garagem",
    paidInstallments: 4,
    totalInstallments: 10,
    dueStatusText: "Venceu há 21 dias",
    gravity: "STANDARD_EXCUSE",
    url: "/painel/dividas/prom-4",
  },
  {
    id: "prom-5",
    debtorId: "deb-5",
    debtorName: "Luciana Prado",
    debtTitle: "Pix da Fatura",
    paidInstallments: 5,
    totalInstallments: 6,
    dueStatusText: "Vence amanhã",
    gravity: "ON_TIME",
    url: "/painel/dividas/prom-5",
  },
];

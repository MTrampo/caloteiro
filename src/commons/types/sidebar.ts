import { ReactNode } from "react";

export type NavLinkItem = {
  title: string;
  url: string;
}

export type NavSectionItem = {
  title: string;
  url: string;
  icon: ReactNode;
  isActive?: boolean;
  subNavs?: NavLinkItem[];
}

export type NavSectionGroup = {
  label?: string;
  items: NavSectionItem[];
}

export type NavRoot = {
  groups?: NavSectionGroup[];
  main?: NavSectionItem[]; // kept for backwards compatibility
}

export type NavTeamItem = {
  name: string;
  logo: ReactNode;
  plan: string;
} 
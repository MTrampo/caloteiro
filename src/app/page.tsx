import type { Metadata } from "next";
import { LandingFeature } from "@/features/landing";
import { getUserLoggedApi } from "@/server/account/service/auth.api";

export const metadata: Metadata = {
  title: "Caloteiro — Sistema de Gestão de Dívidas, Parcelas e Cobranças",
  description:
    "Eles fingem que esqueceram, o Tubarão lembra até o último centavo. Centralize quem te deve em um só lugar: controle dívidas e parcelas, calcule juros, guarde comprovantes, anote promessas e cobre em 1 clique pelo WhatsApp.",
};

export default async function HomePage() {
  const userRes = await getUserLoggedApi();
  const isLoggedIn = !!userRes.data?.user;

  return <LandingFeature isLoggedIn={isLoggedIn} />;
}

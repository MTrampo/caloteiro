import type { Metadata } from "next";
import { LandingFeature } from "@/features/landing";
import { getUserLoggedApi } from "@/server/account/service/auth.api";

export const metadata: Metadata = {
  title: "Caloteiro — A Gruta do Tubarão | Controle de Dívidas e Cobrança no Pix",
  description:
    "Chega de anotar dívidas em bloco de notas e ficar com vergonha de cobrar. Marque suas presas na gruta, registre cada caô e deixe o sistema cobrar o seu Pix.",
};

export default async function HomePage() {
  const userRes = await getUserLoggedApi();
  const isLoggedIn = !!userRes.data?.user;

  return <LandingFeature isLoggedIn={isLoggedIn} />;
}

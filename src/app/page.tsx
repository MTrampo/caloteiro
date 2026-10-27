import type { Metadata } from "next";
import { LandingFeature } from "@/features/landing";

export const metadata: Metadata = {
  title: "Caloteiro — A Gruta do Tubarão | Controle de Dívidas e Cobrança no Pix",
  description:
    "Chega de anotar dívidas em bloco de notas e ficar com vergonha de cobrar. Marque suas presas na gruta, registre cada caô e deixe o sistema cobrar o seu Pix.",
};

export default function HomePage() {
  return <LandingFeature />;
}

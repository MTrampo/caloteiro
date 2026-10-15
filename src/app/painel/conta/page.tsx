import Header from "@/components/header/dashboard";
import { AccountFeature } from "@/features/account";
import { getUserLogged, getProfileByUserIdSupabase } from "@/server/account/repository/auth.supabase";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Minha Conta — Perfil & Segurança",
  description: "Dados cadastrais do tubarão, credenciais de acesso e segurança da conta.",
};

export default async function ContaPage() {
  const {
    data: { user },
  } = await getUserLogged();

  if (!user) {
    redirect("/signin");
  }

  const { data: userProfile } = await getProfileByUserIdSupabase(user.id);

  return (
    <>
      <Header title="Minha Conta" />
      <AccountFeature
        profile={userProfile || null}
        accountCreatedAt={user.created_at}
      />
    </>
  );
}

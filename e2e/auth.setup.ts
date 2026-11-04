import { test as setup } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import fs from "fs";
import path from "path";

if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile();
  } catch {}
}

const authFile = path.join(__dirname, "../playwright/.auth/user.json");

setup("Autenticação Automática de Teste (Supabase)", async ({ context, page }) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  const testEmail = "vinnicius4@hotmail.com";

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: "magiclink",
    email: testEmail,
  });

  if (linkError || !linkData?.properties?.email_otp) {
    throw new Error(`Falha ao gerar magic link para o teste: ${linkError?.message}`);
  }

  const anonClient = createClient(supabaseUrl, anonKey);
  const { data: verifyData, error: verifyError } = await anonClient.auth.verifyOtp({
    email: testEmail,
    token: linkData.properties.email_otp,
    type: "magiclink",
  });

  if (verifyError || !verifyData?.session) {
    throw new Error(`Falha ao verificar OTP para sessão do teste: ${verifyError?.message}`);
  }

  const cookieList: Array<{
    name: string;
    value: string;
    domain: string;
    path: string;
    httpOnly: boolean;
    secure: boolean;
    sameSite: "Lax" | "Strict" | "None";
  }> = [];

  const ssrClient = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll: () => cookieList,
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach((item) => {
          cookieList.push({
            name: item.name,
            value: item.value,
            domain: "localhost",
            path: "/",
            httpOnly: false,
            secure: false,
            sameSite: "Lax",
          });
        });
      },
    },
  });

  await ssrClient.auth.setSession(verifyData.session);

  await context.addCookies(cookieList);

  // Visita /painel uma vez para o middleware sincronizar a sessão de assinatura
  await page.goto("/painel");
  await page.waitForLoadState("domcontentloaded");

  // Garante que o diretório existe e salva o estado de autenticação
  const dir = path.dirname(authFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  await context.storageState({ path: authFile });
});

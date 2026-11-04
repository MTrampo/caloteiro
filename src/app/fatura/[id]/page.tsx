import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Logo } from "@/components/ui/logo";
import { DebtInvoicePortalFeature } from "@/features/debt-invoice-portal";
import {
  checkPublicDebtGateApi,
  getPublicDebtInvoiceDataApi,
} from "@/server/debts/service/debt.api";
import { DEBT_INVOICE_COOKIE_PREFIX } from "@/commons/constants";
import {
  verifySecureCookie,
  getDebtInvoiceCookieSecret,
} from "@/commons/lib/crypto/secure-cookie";
import type { PublicDebtInvoiceViewData } from "@/commons/models/debt";

export const metadata: Metadata = {
  title: "Fatura Protegida | Caloteiro",
  description: "Acompanhamento privado e protegido por código de acesso.",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
    nocache: true,
  },
};

interface PublicDebtInvoicePageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicDebtInvoicePage({
  params,
}: PublicDebtInvoicePageProps) {
  const { id } = await params;

  const gateRes = await checkPublicDebtGateApi(id);

  if (gateRes.status !== 200 || !gateRes.data?.available) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center border-b border-border bg-background/90 backdrop-blur-md">
          <div className="flex w-full items-center justify-between mx-auto px-6 max-w-5xl md:max-w-7xl">
            <Logo size="md" showText />
          </div>
        </header>

        <main className="flex-1 w-full mx-auto px-6 py-12 sm:py-24 max-w-5xl md:max-w-7xl flex items-center justify-center">
          <div className="text-center space-y-3 max-w-md mx-auto">
            <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-white">
              Link de Fatura Indisponível
            </h2>
            <p className="text-xs sm:text-sm font-mono text-zinc-400 leading-relaxed">
              Este link de acompanhamento não está habilitado no momento ou o endereço informado está incorreto. Solicite um novo link atualizado a quem enviou para você.
            </p>
          </div>
        </main>

        <footer className="border-t border-border/40 py-6 text-center text-xs font-mono text-zinc-500">
          <div className="mx-auto px-6 max-w-5xl md:max-w-7xl">
            Caloteiro • Ambiente privado de acompanhamento
          </div>
        </footer>
      </div>
    );
  }

  let initialInvoice: PublicDebtInvoiceViewData | null = null;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(`${DEBT_INVOICE_COOKIE_PREFIX}${id}`)?.value;

    if (token) {
      const secret = getDebtInvoiceCookieSecret(id);
      const verified = await verifySecureCookie<{
        debtId: string;
        accessCode: string;
      }>(token, secret);

      if (verified && verified.debtId === id && verified.accessCode) {
        const invoiceRes = await getPublicDebtInvoiceDataApi({
          debtId: id,
          accessCode: verified.accessCode,
        });

        if (invoiceRes.status === 200 && invoiceRes.data) {
          initialInvoice = invoiceRes.data;
        }
      }
    }
  } catch {
    initialInvoice = null;
  }

  return (
    <DebtInvoicePortalFeature
      debtId={id}
      initialInvoice={initialInvoice}
    />
  );
}


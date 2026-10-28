import { NextResponse, type NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { MercadoPagoStatusEnum } from "@/commons/enums/subscription";
import type { SubscriptionPayloadCookie } from "@/commons/models/subscription";
import { SUB_SECRET_KEY } from "@/commons/constants/env";
import {
  PUBLIC_API_ROUTES,
  PUBLIC_PATHS,
  AUTH_PATHS,
  ROUTE_ENTRAR,
  ROUTE_PAINEL,
  ROUTE_ASSINATURA,
  ROUTE_CONVITE,
  ROUTE_FATURA,
  ROUTE_DOCUMENTOS,
  SUBSCRIPTION_GRACE_PERIOD_MS,
} from "@/commons/constants";
import {
  signSecureCookie,
  verifySecureCookie,
  getUserCookieSecret,
} from "@/commons/lib/crypto/secure-cookie";

async function syncSubscriptionCookieFromDb(
  request: NextRequest,
  supabaseResponse: NextResponse,
  supabase: SupabaseClient,
  currentUserId: string
): Promise<SubscriptionPayloadCookie | null> {
  try {
    const { data: subRow } = await supabase
      .from("subscriptions")
      .select("id, mp_status, current_period_end, plan:plans(slug)")
      .eq("user_id", currentUserId)
      .maybeSingle();

    if (!subRow) return null;

    const planRelation = Array.isArray(subRow.plan) ? subRow.plan[0] : subRow.plan;
    const cookiePayload: SubscriptionPayloadCookie = {
      subscriptionId: subRow.id,
      status: subRow.mp_status,
      currentPeriodEnd: subRow.current_period_end,
      userId: currentUserId,
      planSlug: (planRelation as { slug?: string } | null)?.slug || null,
    };

    if (!isSubscriptionActive(cookiePayload)) {
      return null;
    }

    const userSecret = getUserCookieSecret(currentUserId);
    const signedToken = await signSecureCookie(cookiePayload, userSecret);
    const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
    const isSecure =
      process.env.NODE_ENV === "production" ||
      forwardedProto === "https" ||
      request.nextUrl.protocol === "https:";

    supabaseResponse.cookies.set(SUB_SECRET_KEY, signedToken, {
      httpOnly: true,
      secure: isSecure,
      maxAge: 30 * 24 * 60 * 60, // 30 dias
      path: "/",
      sameSite: "lax",
    });

    return cookiePayload;
  } catch (error) {
    console.error("[security:syncSubscriptionCookieFromDb] Erro ao sincronizar cookie:", error);
    return null;
  }
}

export async function handleRouteAccess(
  request: NextRequest,
  user: unknown,
  supabaseResponse: NextResponse,
  supabase?: SupabaseClient
) {
  const pathname = request.nextUrl.pathname;

  const isPublicApiRoute = PUBLIC_API_ROUTES.some((path) => pathname.startsWith(path));
  const isPublicPath =
    PUBLIC_PATHS.some((path) => pathname === path) ||
    pathname.startsWith(ROUTE_CONVITE) ||
    pathname.startsWith(ROUTE_FATURA) ||
    pathname.startsWith(ROUTE_DOCUMENTOS);

  // API não autenticada → 401
  if (!user && pathname.startsWith("/api/") && !isPublicApiRoute) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  // Não autenticado em rota privada → /entrar
  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTE_ENTRAR;
    return NextResponse.redirect(url);
  }

  // Autenticado tentando acessar páginas de auth → /painel
  if (user && (AUTH_PATHS as readonly string[]).includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTE_PAINEL;
    return NextResponse.redirect(url);
  }

  const currentUserId =
    (user as { sub?: string; id?: string })?.sub ||
    (user as { sub?: string; id?: string })?.id;

  // Ao acessar a tela de boas-vindas (/assinatura/sucesso), atualiza o cookie de assinatura automaticamente
  if (user && currentUserId && supabase && pathname.startsWith("/assinatura/sucesso")) {
    await syncSubscriptionCookieFromDb(request, supabaseResponse, supabase, currentUserId);
    return supabaseResponse;
  }

  // Autenticado acessando /painel/** → verificar assinatura de forma assinada e segura
  if (user && pathname.startsWith(ROUTE_PAINEL)) {
    const cookieName = SUB_SECRET_KEY;
    const cookieValue = request.cookies.get(cookieName)?.value;

    if (cookieValue && currentUserId) {
      try {
        const userSecret = getUserCookieSecret(currentUserId);
        const subscription = await verifySecureCookie<SubscriptionPayloadCookie>(
          cookieValue,
          userSecret
        );

        if (
          subscription &&
          (!subscription.userId || subscription.userId === currentUserId) &&
          isSubscriptionActive(subscription)
        ) {
          return supabaseResponse;
        }
      } catch {
        // Segue para fallback no banco de dados abaixo
      }
    }

    // Fallback automático: se o usuário acabou de assinar/fazer upgrade (mesmo fechando a aba do MP)
    // ou está sem o cookie no navegador, consulta o banco e emite o cookie SUB_SECRET_KEY automaticamente.
    if (currentUserId && supabase) {
      const synced = await syncSubscriptionCookieFromDb(
        request,
        supabaseResponse,
        supabase,
        currentUserId
      );
      if (synced) {
        return supabaseResponse;
      }
    }

    const url = request.nextUrl.clone();
    url.pathname = ROUTE_ASSINATURA;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export function isSubscriptionActive(subscription: SubscriptionPayloadCookie): boolean {
  const status = subscription.status as MercadoPagoStatusEnum;

  if (
    status === MercadoPagoStatusEnum.Paused ||
    status === MercadoPagoStatusEnum.Rejected
  ) {
    return false;
  }

  // Cancelado pelo usuário ou sistema, mas ainda dentro do ciclo pago
  if (status === MercadoPagoStatusEnum.Cancelled) {
    if (!subscription.currentPeriodEnd) return false;

    const endDate = new Date(subscription.currentPeriodEnd).getTime();
    if (isNaN(endDate)) return false;

    return endDate + SUBSCRIPTION_GRACE_PERIOD_MS > Date.now();
  }

  // Autorizado / Ativo
  if (status === MercadoPagoStatusEnum.Authorized) {
    if (!subscription.currentPeriodEnd) return true;

    const endDate = new Date(subscription.currentPeriodEnd).getTime();
    if (isNaN(endDate)) return true;

    return endDate + SUBSCRIPTION_GRACE_PERIOD_MS > Date.now();
  }

  return false;
}
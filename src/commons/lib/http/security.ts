import { NextResponse, type NextRequest } from 'next/server'
import { MercadoPagoStatusEnum } from '@/commons/enums/subscription'
import type { SubscriptionPayloadCookie } from '@/commons/models/subscription'
import { SUB_SECRET_KEY } from '@/commons/constants/env'
import {
  PUBLIC_API_ROUTES,
  PUBLIC_PATHS,
  AUTH_PATHS,
  ROUTE_ENTRAR,
  ROUTE_PAINEL,
  ROUTE_ASSINATURA,
  ROUTE_CONVITE,
  SUBSCRIPTION_GRACE_PERIOD_MS,
} from '@/commons/constants'
import { verifySecureCookie, getUserCookieSecret } from '@/commons/lib/crypto/secure-cookie'

export async function handleRouteAccess(request: NextRequest, user: unknown, supabaseResponse: NextResponse) {
  const pathname = request.nextUrl.pathname

  const isPublicApiRoute = PUBLIC_API_ROUTES.some(path => pathname.startsWith(path))
  const isPublicPath = PUBLIC_PATHS.some(path => pathname === path) || pathname.startsWith(ROUTE_CONVITE)

  // API não autenticada → 401
  if (!user && pathname.startsWith('/api/') && !isPublicApiRoute) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  // Não autenticado em rota privada → /entrar
  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = ROUTE_ENTRAR
    return NextResponse.redirect(url)
  }

  // Autenticado tentando acessar páginas de auth → /painel
  if (user && (AUTH_PATHS as readonly string[]).includes(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = ROUTE_PAINEL
    return NextResponse.redirect(url)
  }

  // Autenticado acessando /painel/** → verificar assinatura de forma assinada e segura
  if (user && pathname.startsWith(ROUTE_PAINEL)) {
    const cookieName = SUB_SECRET_KEY
    const cookieValue = request.cookies.get(cookieName)?.value

    if (!cookieValue) {
      const url = request.nextUrl.clone()
      url.pathname = ROUTE_ASSINATURA
      return NextResponse.redirect(url)
    }

    try {
      const currentUserId =
        (user as { sub?: string; id?: string })?.sub ||
        (user as { sub?: string; id?: string })?.id

      const userSecret = getUserCookieSecret(currentUserId)
      const subscription = await verifySecureCookie<SubscriptionPayloadCookie>(
        cookieValue,
        userSecret
      )

      if (
        !subscription ||
        (subscription.userId && currentUserId && subscription.userId !== currentUserId) ||
        !isSubscriptionActive(subscription)
      ) {
        const url = request.nextUrl.clone()
        url.pathname = ROUTE_ASSINATURA
        return NextResponse.redirect(url)
      }

    } catch {
      const url = request.nextUrl.clone()
      url.pathname = ROUTE_ASSINATURA
      return NextResponse.redirect(url)
    }
  }


  return supabaseResponse
}

export function isSubscriptionActive(subscription: SubscriptionPayloadCookie): boolean {
  const status = subscription.status as MercadoPagoStatusEnum

  if (status === MercadoPagoStatusEnum.Paused || status === MercadoPagoStatusEnum.Rejected) {
    return false
  }

  // Cancelado pelo usuário ou sistema, mas ainda dentro do ciclo pago
  if (status === MercadoPagoStatusEnum.Cancelled) {
    if (!subscription.currentPeriodEnd) return false

    const endDate = new Date(subscription.currentPeriodEnd).getTime()
    if (isNaN(endDate)) return false

    return endDate + SUBSCRIPTION_GRACE_PERIOD_MS > Date.now()
  }

  // Autorizado / Ativo
  if (status === MercadoPagoStatusEnum.Authorized) {
    if (!subscription.currentPeriodEnd) return true

    const endDate = new Date(subscription.currentPeriodEnd).getTime()
    if (isNaN(endDate)) return true

    return endDate + SUBSCRIPTION_GRACE_PERIOD_MS > Date.now()
  }

  return false
}
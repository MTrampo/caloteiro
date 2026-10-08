'use server'

import { cookies } from 'next/headers'
import { SUB_SECRET_KEY, COOKIE_SIGNING_SECRET } from '@/commons/constants/env'
import { signSecureCookie, verifySecureCookie, getUserCookieSecret } from '@/commons/lib/crypto/secure-cookie'
import type { SubscriptionPayloadCookie } from '@/commons/models/subscription'

const KEY_SUB = SUB_SECRET_KEY
const expiresIn = 60 * 60 * 24 * 30 * 1000 // 30 dias em ms

export async function setCookieSubscription(payload: SubscriptionPayloadCookie | string, userId?: string): Promise<void> {
  try {
    const dataToSign: SubscriptionPayloadCookie = typeof payload === 'string' ? JSON.parse(payload) : payload
    const targetUserId = userId || dataToSign.userId
    const secret = getUserCookieSecret(targetUserId)
    const signedToken = await signSecureCookie(dataToSign, secret)

    const cookieStore = await cookies()
    cookieStore.set(KEY_SUB, signedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiresIn / 1000, // segundos
      path: '/',
      sameSite: 'strict',
    })
  } catch (error: any) {
    // No Next.js App Router, cookies não podem ser modificados durante a fase de renderização SSR.
    // Ignoramos silenciosamente se for erro de contexto SSR, e logamos apenas se for erro inesperado.
    if (!error?.message?.includes('Cookies can only be modified')) {
      console.error('[setCookieSubscription] Erro ao assinar e salvar cookie de assinatura:', error)
    }
  }
}

export async function getCookieSubscriptionPayload(userId?: string): Promise<SubscriptionPayloadCookie | null> {
  try {
    const cookieStore = await cookies()
    const rawToken = cookieStore.get(KEY_SUB)?.value
    if (!rawToken) return null

    let targetUserId = userId
    if (!targetUserId) {
      const { getUserLoggedApi } = await import('@/back/account/service/auth.api')
      const userResult = await getUserLoggedApi()
      targetUserId = userResult?.data?.user?.id
    }

    if (!targetUserId) return null

    const secret = getUserCookieSecret(targetUserId)
    return await verifySecureCookie<SubscriptionPayloadCookie>(rawToken, secret)
  } catch (error) {
    return null
  }
}



export async function getCookieSubscription(): Promise<string | null> {
  const cookieStore = await cookies()
  const cookieValue = cookieStore.get(KEY_SUB)?.value
  return cookieValue || null
}

export async function clearCookieSubscription(): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.delete(KEY_SUB)
  } catch (error: any) {
    if (!error?.message?.includes('Cookies can only be modified')) {
      console.error('[clearCookieSubscription] Erro ao limpar cookie de assinatura:', error)
    }
  }
}
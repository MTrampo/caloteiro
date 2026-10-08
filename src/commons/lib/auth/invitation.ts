'use server'

import { cookies } from 'next/headers'
import { COOKIE_SIGNING_SECRET } from '@/commons/constants/env'
import { INVITATION_COOKIE_KEY, INVITATION_COOKIE_MAX_AGE_MS } from '@/commons/constants'
import { signSecureCookie, verifySecureCookie } from '@/commons/lib/crypto/secure-cookie'

export async function setInvitationCookie(token: string): Promise<void> {
  try {
    const signedToken = await signSecureCookie({ token }, COOKIE_SIGNING_SECRET)
    const cookieStore = await cookies()
    cookieStore.set(INVITATION_COOKIE_KEY, signedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: INVITATION_COOKIE_MAX_AGE_MS / 1000,
      path: '/',
      sameSite: 'lax',
    })
  } catch (error) {
    console.error('Error setting invitation cookie:', error)
  }
}

export async function getInvitationCookie(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const rawToken = cookieStore.get(INVITATION_COOKIE_KEY)?.value
    if (!rawToken) return null

    const verified = await verifySecureCookie<{ token: string } | string>(rawToken, COOKIE_SIGNING_SECRET)
    if (!verified) return null

    return typeof verified === 'string' ? verified : verified.token || null
  } catch {
    return null
  }
}

export async function clearInvitationCookie(): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.delete(INVITATION_COOKIE_KEY)
  } catch (error) {
    console.error('Error clearing invitation cookie:', error)
  }
}


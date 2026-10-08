import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  let user = null
  try {
    const { data } = await supabase.auth.getClaims()
    user = data?.claims
  } catch (error) {
    console.error('[updateSession] Erro ao recuperar claims de autenticação:', error)

    // Remove cookies do Supabase se o token estiver inválido para evitar loops
    const supabaseCookieNames = request.cookies.getAll()
      .filter(c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'))
      .map(c => c.name)

    supabaseCookieNames.forEach(name => {
      request.cookies.delete(name)
      supabaseResponse.cookies.delete(name)
    })
  }

  return { user, supabaseResponse }
}
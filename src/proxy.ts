import { type NextRequest } from "next/server"
import { updateSession } from "@/commons/lib/supabase/session"
import { handleRouteAccess } from "./commons/lib/http/security"

export async function proxy(request: NextRequest) {
  const { user, supabaseResponse, supabase } = await updateSession(request)
  return await handleRouteAccess(request, user, supabaseResponse, supabase)
}


export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|sw.js|offline.html|favicon.ico|manifest.webmanifest|manifest.json|robots.txt|sitemap.xml|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest|json|xml|txt)$).*)",
  ],
}
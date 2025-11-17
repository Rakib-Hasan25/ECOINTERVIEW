import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerSideClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
            // console.log(cookieStore.getAll(),"cookiesTogetttt");
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            console.log(cookiesToSet,"cookiesToSet");
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
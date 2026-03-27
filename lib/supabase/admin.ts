import { createClient } from "@supabase/supabase-js"

// Admin client that doesn't use cookies - for API routes
let adminClient: ReturnType<typeof createClient> | null = null

export function getAdminClient() {
  if (!adminClient) {
    adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  }
  return adminClient
}

import { createClient } from "@supabase/supabase-js"

// Admin client that doesn't use cookies - for API routes
let adminClient: ReturnType<typeof createClient> | null = null

export function getAdminClient() {
  if (!adminClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error("[Supabase] Missing environment variables:", {
        hasUrl: !!supabaseUrl,
        hasKey: !!serviceRoleKey,
      })
      throw new Error("Missing Supabase environment variables")
    }
    
    adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }
  return adminClient
}

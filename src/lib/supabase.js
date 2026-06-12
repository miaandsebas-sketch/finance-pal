import { createClient } from '@supabase/supabase-js'

// When embedded in the hub, the hub owns the auth session: tokens arrive via
// the URL hash and refreshed ones via postMessage. Keep our copy in memory
// only — persisting and auto-refreshing a copied refresh token races the
// hub's client and gets the whole token family revoked, which silently turns
// every query anonymous.
const embedded = window.self !== window.top

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  embedded ? { auth: { persistSession: false, autoRefreshToken: false } } : undefined
)

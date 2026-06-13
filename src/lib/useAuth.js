import { useState, useEffect } from 'react'
import { supabase } from './supabase.js'

// Session/auth for both standalone and hub-embedded use. When embedded, the hub
// owns the refresh token: it arrives via the URL hash on open and via
// postMessage afterwards; we request a fresh one before ours expires and never
// refresh it ourselves (that would race the hub and revoke the token family).
export function useAuth() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    async function initAuth() {
      if (window.location.hash.includes('access_token')) {
        const params = new URLSearchParams(window.location.hash.slice(1))
        const access_token = params.get('access_token')
        const refresh_token = params.get('refresh_token')
        if (access_token && refresh_token) {
          await supabase.auth.setSession({ access_token, refresh_token })
          window.history.replaceState(null, '', window.location.pathname + window.location.search)
        }
      }
      let { data: { session } } = await supabase.auth.getSession()
      if (!session && window.self !== window.top) {
        // e.g. the iframe reloaded after the hash was consumed — ask the hub
        window.parent.postMessage({ type: 'app:requestToken' }, '*')
        await new Promise(r => setTimeout(r, 1500))
        ;({ data: { session } } = await supabase.auth.getSession())
      }
      setSession(session)
      setAuthLoading(false)
    }
    initAuth()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  // While embedded, accept fresh tokens the hub sends — but only from the hub
  // (our parent frame), never another window.
  useEffect(() => {
    if (window.self === window.top) return
    function onMessage(e) {
      if (e.source !== window.parent) return
      if (e.data?.type === 'hub:token' && e.data.access_token && e.data.refresh_token) {
        supabase.auth.setSession({ access_token: e.data.access_token, refresh_token: e.data.refresh_token })
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  // Ask the hub for a fresh token before the current one expires.
  useEffect(() => {
    if (window.self === window.top || !session) return
    const id = setInterval(() => {
      if (session.expires_at * 1000 - Date.now() < 10 * 60 * 1000) {
        window.parent.postMessage({ type: 'app:requestToken' }, '*')
      }
    }, 30000)
    return () => clearInterval(id)
  }, [session])

  return { session, authLoading }
}

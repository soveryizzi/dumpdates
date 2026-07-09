import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Auth only (signup/login/session). Never call supabase.from(...) — the SDK's
// query builder has a known initializePromise hang bug. All table reads and
// writes go through dbQuery() below instead: a raw fetch() against the REST
// endpoint with the current session's access token passed explicitly.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function getAccessToken() {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? SUPABASE_ANON_KEY
}

// path is a PostgREST path + query string, e.g. "groups?select=*&id=eq.123"
export async function dbQuery(path, { method = 'GET', body, headers = {} } = {}) {
  const accessToken = await getAccessToken()

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    throw new Error(errorBody?.message || `dbQuery failed: ${response.status} ${response.statusText}`)
  }

  if (response.status === 204) return null
  return response.json()
}

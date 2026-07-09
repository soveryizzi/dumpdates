import { supabase } from '../supabase.js'

export function signUp(email, password) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin + import.meta.env.BASE_URL,
    },
  })
}

export function signIn(email, password) {
  return supabase.auth.signInWithPassword({ email, password })
}

export function signOut() {
  return supabase.auth.signOut()
}

// Fires immediately with the current session (or null), then again on every
// login/logout/token refresh — this is the one place the UI needs to react to.
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => callback(session))
}

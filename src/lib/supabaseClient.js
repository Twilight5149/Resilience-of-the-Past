import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

const notConfiguredError = {
  message: "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local.",
}

const createMockQuery = (result = { data: [], error: null }) => {
  const query = {
    select: () => query,
    insert: () => query,
    update: () => query,
    delete: () => query,
    eq: () => query,
    neq: () => query,
    ilike: () => query,
    in: () => query,
    order: () => query,
    single: () => Promise.resolve({ data: null, error: notConfiguredError }),
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  }

  return query
}

const mockSupabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    signInWithPassword: async () => ({ data: null, error: notConfiguredError }),
    signUp: async () => ({ data: null, error: notConfiguredError }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({
      data: {
        subscription: {
          unsubscribe: () => {},
        },
      },
    }),
  },
  from: () => createMockQuery(),
  storage: {
    from: () => ({
      getPublicUrl: (path) => ({ data: { publicUrl: path || "/placeholder.jpg" } }),
      upload: async () => ({ data: null, error: notConfiguredError }),
    }),
  },
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : mockSupabase

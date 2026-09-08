import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// Only the public project URL and publishable key belong in the browser bundle.
export const supabase = url && key ? createClient(url, key) : null

import { createClient } from '@supabase/supabase-js'

// Provide fallback values to prevent createClient from throwing during module load
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.warn('Supabase credentials missing. Checklist: .env file created? Application restarted?')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

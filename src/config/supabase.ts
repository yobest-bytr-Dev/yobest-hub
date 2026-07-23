import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pohslivolczprxacroje.supabase.co'
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_zg1KBuWhnqVm8GM8q4siIA_M1BC1vyG'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

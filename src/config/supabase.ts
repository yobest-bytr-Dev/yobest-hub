import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = 'https://pohslivolczprxacroje.supabase.co'
export const supabaseAnonKey = 'sb_publishable_zg1KBuWhnqVm8GM8q4siIA_M1BC1vyG'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const supabaseServiceRoleKey = 'c458ff478ac37939c1feb02bca70fd83647f92bdd7db5bb31ff290e5a4812ef6'

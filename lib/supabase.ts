import { createClient } from '@supabase/supabase-js'

// The || '' is the magic part. It gives the code a "blank" key 
// instead of nothing, which stops the 'is required' crash.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
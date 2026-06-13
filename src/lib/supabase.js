import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lgamvdcycsvmdbzzafiw.supabase.co'
const supabaseAnonKey = 'sb_publishable_XOgttzC7bKOKiV6iniHCHA_abwlSjDp'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

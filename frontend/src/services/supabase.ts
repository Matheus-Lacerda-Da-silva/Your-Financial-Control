import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const chave = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

export const supabase = url?.startsWith('https://') && URL.canParse(url) && chave?.startsWith('sb_publishable_')
  ? createClient(url, chave)
  : null

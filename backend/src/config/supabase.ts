import { createClient } from '@supabase/supabase-js'

export const LIST_TABLE = 'tula'

const supabaseUrl = process.env.SUPABASE_URL

const supabaseKey =
	process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY

export const supabase =
	supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

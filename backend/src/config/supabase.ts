import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL

const supabaseKey =
	process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
	throw new Error(
		'Supabase не настроен: задайте SUPABASE_URL и ключ в окружении'
	)
}

export const supabase = createClient(supabaseUrl, supabaseKey)
export const LIST_TABLE = 'tula'

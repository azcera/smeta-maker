import path from 'path'
import dotenv from 'dotenv'

// На хостинге переменные уже находятся в process.env. Локально
// читаем .env из родительской папки backend; существующие переменные
// окружения dotenv не перезаписывает.
dotenv.config({
	path: path.resolve(process.cwd(), '../.env')
})

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey =
	process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
	throw new Error(
		'Supabase не настроен: задайте SUPABASE_URL и ключ в окружении'
	)
}

export const env = { supabaseUrl, supabaseKey }

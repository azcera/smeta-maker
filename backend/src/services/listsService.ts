import { LIST_TABLE, supabase as supabaseInstance } from '../config/supabase'

// проверяем инициализацию
if (!supabaseInstance) {
	throw new Error(
		'Supabase не настроен: задайте SUPABASE_URL и ключ в окружении'
	)
}

const supabase = supabaseInstance

interface FetchWorksType {
	id?: number
	category?: string
}

export const fetchWorks = async ({ id, category }: FetchWorksType) => {
	let query = supabase.from(LIST_TABLE).select('*')

	if (id) {
		query = query.eq('_id', id)
	} else if (category) {
		query = query.ilike('kategor', `%${category}%`)
	}

	const { data, error } = await query
	if (error) throw error
	return data
}

export const fetchUnits = async () => {
	const { data, error } = await supabase
		.from(LIST_TABLE)
		.select('distinct(izmer)')

	if (error) throw error
	return data
}

export const fetchLastUpdate = async () => {
	const { data, error } = await supabase
		.from(LIST_TABLE)
		.select('created_at')
		.not('created_at', 'is', null)
		.order('created_at', { ascending: false })
		.limit(1)
		.single()

	if (error) throw error
	return data
}

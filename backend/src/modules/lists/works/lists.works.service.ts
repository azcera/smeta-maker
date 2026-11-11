import { LIST_TABLE, supabase } from '../../../config/supabase'
import { unwrap } from '../../../utils/supabaseHelper'
import type { FetchWorksType } from './lists.works.schema'

export const fetchWorks = ({ id, category }: FetchWorksType) => {
	let query = supabase.from(LIST_TABLE).select('*')

	if (id) {
		query = query.eq('_id', id)
	} else if (category) {
		query = query.ilike('kategor', `%${category}%`)
	}

	return unwrap(query)
}

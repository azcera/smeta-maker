import { LIST_TABLE, supabase } from '../../../config/supabase'
import { unwrap } from '../../../utils/supabaseHelper'
import {
	lastUpdateRowSchema,
	type LastUpdateRow
} from './lists.last-update.schema'

export const fetchLastUpdate = async (): Promise<LastUpdateRow | null> => {
	const raw = await unwrap<unknown>(
		supabase
			.from(LIST_TABLE)
			.select('created_at')
			.not('created_at', 'is', null)
			.order('created_at', { ascending: false })
			.limit(1)
			.maybeSingle()
	)

	if (raw === null) return null

	// parse вернёт { created_at: Date }
	return lastUpdateRowSchema.parse(raw)
}

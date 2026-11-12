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
			.select('updated_at')
			.not('updated_at', 'is', null)
			.order('updated_at', { ascending: false })
			.limit(1)
			.maybeSingle()
	)

	if (raw === null) return null

	// parse вернёт { updated_at: Date }
	return lastUpdateRowSchema.parse(raw)
}

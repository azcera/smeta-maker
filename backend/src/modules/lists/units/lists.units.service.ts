import { LIST_TABLE, supabase } from '../../../config/supabase'
import { unwrap } from '../../../utils/supabaseHelper'
import { unitsResponseSchema, type UnitsRow } from './lists.units.schema'

export const fetchUnits = async (): Promise<UnitsRow[]> => {
	const raw = await unwrap(supabase.from(LIST_TABLE).select('distinct(izmer)'))

	// validate + parse — приводим к типу и падаем, если Supabase вернул мусор
	return unitsResponseSchema.parse(raw)
}

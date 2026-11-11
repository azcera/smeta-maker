import {
	PostgrestSingleResponse,
	PostgrestResponse
} from '@supabase/supabase-js'

export async function unwrap<T>(
	query: PromiseLike<PostgrestSingleResponse<T> | PostgrestResponse<T>>
): Promise<T> {
	const { data, error } = await query
	if (error) {
		throw error
	}
	return data as T
}

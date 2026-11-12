import { z } from 'zod'

// Что реально возвращает Supabase: объект с одним полем updated_at
export const lastUpdateRowSchema = z.object({
	updated_at: z.coerce.date() // превратит строку в Date, упадёт на мусоре
})

export type LastUpdateRow = z.infer<typeof lastUpdateRowSchema>

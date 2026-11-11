import { z } from 'zod'

// Supabase возвращает массив строк вида [{ izmer: 'кг' }, { izmer: 'шт' }]
export const unitsRowSchema = z.object({
	izmer: z.string().nullable() // колонка может быть NULL в БД
})

export const unitsResponseSchema = z.array(unitsRowSchema)

export type UnitsRow = z.infer<typeof unitsRowSchema>

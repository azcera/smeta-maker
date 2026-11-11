import { z } from 'zod'

export const worksQuerySchema = z.object({
	// Преобразуем строку из URL в число
	id: z.coerce.number().int().positive().optional(),
	// Строка должна быть непустой и иметь разумный лимит
	category: z.string().min(1).max(100).optional()
})

// Выводим TypeScript-тип из схемы (вместо interface FetchWorksType)
export type FetchWorksType = z.infer<typeof worksQuerySchema>

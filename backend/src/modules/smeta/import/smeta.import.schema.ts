import { z } from 'zod'

export const smetaItemSchema = z.object({
	name: z.string().min(1), // пустые названия позиций — баг парсера
	price: z.number().nonnegative(),
	quantity: z.number().nonnegative(),
	unit: z.string().min(1) // unitAdapter должен вернуть непустую строку
})

export const smetaPlaceSchema = z.record(
	z.string().min(1), // имя помещения
	z.array(smetaItemSchema)
)

export const uploadSmetaResultSchema = z.object({
	success: z.literal(true), // сервис всегда возвращает success: true
	data: z.object({
		object: z.string().nullable(), // null допустим — объект может быть не указан
		places: smetaPlaceSchema,
		transportCost: z.number().nonnegative().optional(),
		trashCost: z.number().nonnegative().optional()
	})
})

export type SmetaItem = z.infer<typeof smetaItemSchema>
export type SmetaPlace = z.infer<typeof smetaPlaceSchema>
export type UploadSmetaResult = z.infer<typeof uploadSmetaResultSchema>

import { z } from 'zod'

export const workItemSchema = z.object({
	name: z.string().min(1, 'Название работы обязательно'),
	unit: z.string().min(1, 'Единица измерения обязательна'),
	quantity: z.coerce.number().nonnegative(),
	price: z.coerce.number().nonnegative()
})

export const placesSchema = z.record(
	z.string().min(1, 'Имя помещения не может быть пустым'),
	z.array(workItemSchema).min(1, 'В помещении должна быть хотя бы одна работа')
)

export const generateSmetaBodySchema = z.object({
	object: z
		.string()
		.trim()
		.min(1, 'Наименование объекта обязательно')
		.max(200, 'Слишком длинное наименование'),
	places: placesSchema.refine(
		p => Object.keys(p).length > 0,
		'Должно быть хотя бы одно помещение'
	),
	transportCost: z.coerce.number().nonnegative().optional(),
	trashCost: z.coerce.number().nonnegative().optional()
})

export type WorkItem = z.infer<typeof workItemSchema>
export type Places = z.infer<typeof placesSchema>
export type GenerateSmetaBody = z.infer<typeof generateSmetaBodySchema>

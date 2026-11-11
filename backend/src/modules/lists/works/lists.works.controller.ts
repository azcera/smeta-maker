import { Request, Response } from 'express'
import { asyncHandler } from '../../../utils/asyncHandler'
import { fetchWorks } from './lists.works.service'
import { worksQuerySchema } from './lists.works.schema'

export const getWorks = asyncHandler(async (req: Request, res: Response) => {
	// Валидация и приведение типов в одну строку
	const validatedQuery = worksQuerySchema.parse(req.query)

	// Передаем в сервис уже проверенный объект
	const data = await fetchWorks(validatedQuery)

	res.json(data ?? [])
})

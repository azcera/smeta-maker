import { NextFunction, Request, Response } from 'express'
import { ZodAny, ZodError } from 'zod'
import { AppError } from '../utils/appError'

export const validate = (schema: ZodAny) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			const parsed = await schema.parseAsync({
				body: req.body,
				query: req.query,
				params: req.params
			})

			// Перезаписываем данные на уже очищенные и приведенные к нужным типам
			req.body = parsed.body
			req.query = parsed.query
			req.params = parsed.params

			return next()
		} catch (err) {
			if (err instanceof ZodError) {
				// Собираем понятное сообщение из всех ошибок Zod
				const message = err.issues.map(issue => issue.message).join(', ')
				return next(new AppError(message, 400))
			}
			return next(err)
		}
	}
}

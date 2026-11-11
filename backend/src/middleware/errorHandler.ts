// middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/appError'

export function errorHandler(
	err: unknown,
	req: Request,
	res: Response,
	next: NextFunction
) {
	console.error(err)

	if (err instanceof AppError) {
		return res.status(err.statusCode).json({ error: err.message })
	}

	const message =
		err instanceof Error ? err.message : 'Внутренняя ошибка сервера'

	return res.status(500).json({ error: message })
}

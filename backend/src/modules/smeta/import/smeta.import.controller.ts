import { Request, Response } from 'express'
import { ZodError } from 'zod'
import { AppError } from '../../../utils/appError'
import { uploadSmeta } from './smeta.import.service'

export const importSmeta = async (req: Request, res: Response) => {
	try {
		if (!req.file?.buffer) {
			throw new AppError('Файл не загружен', 400)
		}

		const data = await uploadSmeta(Buffer.from(req.file.buffer))
		return res.json({ success: true, data })
	} catch (err: unknown) {
		console.error(err)

		// Если Zod упал — это баг парсера, отдаём 500, но с понятным сообщением
		if (err instanceof ZodError) {
			return res.status(500).json({
				error: 'Некорректная структура сметы',
				details: err.issues // полезно для отладки, в проде можно скрыть
			})
		}

		const message =
			err instanceof Error ? err.message : 'Не удалось прочитать смету'
		const code = err instanceof AppError ? err.statusCode : 500
		return res.status(code).json({ error: message })
	}
}

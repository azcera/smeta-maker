import { Request, Response } from 'express'
import { generateSmeta } from '../services/getSmetaService'
import { uploadSmeta } from '../services/uploadSmetaService'
import { AppError } from '../utils/appError'

export const getSmetaController = async (req: Request, res: Response) => {
	try {
		const { xlsxBuffer, filename } = await generateSmeta(req.body)
		if (!xlsxBuffer) {
			throw new AppError('Ошибка в генерации сметы')
		}
		res.status(200)
		res.setHeader(
			'Content-Type',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		)
		res.setHeader('Content-Disposition', `inline; filename="${filename}"`)
		res.setHeader('Content-Length', String(xlsxBuffer.length))
		res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition')

		return res.end(xlsxBuffer)
	} catch (err: unknown) {
		console.error(err)

		const message =
			err instanceof Error ? err.message : 'Не удалось прочитать смету'

		const code = err instanceof AppError ? err.statusCode : 500
		return res.status(code).json({ error: message })
	}
}

export const uploadSmetaController = async (req: Request, res: Response) => {
	try {
		if (!req.file?.buffer) {
			throw new AppError('Файл не загружен', 400)
		}

		const data = await uploadSmeta(Buffer.from(req.file.buffer))

		return res.json(data)
	} catch (err: unknown) {
		console.error(err)

		const message =
			err instanceof Error ? err.message : 'Не удалось прочитать смету'

		const code = err instanceof AppError ? err.statusCode : 500
		return res.status(code).json({ error: message })
	}
}

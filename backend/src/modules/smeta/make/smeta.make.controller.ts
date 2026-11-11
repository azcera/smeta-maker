import { Request, Response } from 'express'
import { AppError } from '../../../utils/appError'
import { asyncHandler } from '../../../utils/asyncHandler'
import { generateSmetaBodySchema } from './smeta.make.schema'
import { generateSmeta } from './smeta.make.service'

export const makeSmeta = asyncHandler(async (req: Request, res: Response) => {
	// safeParse — не бросает, чтобы вернуть красивый 400 со списком ошибок
	const parsed = generateSmetaBodySchema.safeParse(req.body)

	if (!parsed.success) {
		throw new AppError(
			'Некорректные данные сметы: ' +
				parsed.error.issues
					.map(i => `${i.path.join('.')}: ${i.message}`)
					.join('; '),
			400
		)
	}

	const { xlsxBuffer, filename } = await generateSmeta(parsed.data)

	if (!xlsxBuffer) {
		throw new AppError('Ошибка в генерации сметы', 500)
	}

	res.status(200).set({
		'Content-Type':
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		'Content-Disposition': `inline; filename="${encodeURIComponent(filename)}"`,
		'Content-Length': String(xlsxBuffer.length),
		'Access-Control-Expose-Headers': 'Content-Disposition'
	})

	return res.end(xlsxBuffer)
})

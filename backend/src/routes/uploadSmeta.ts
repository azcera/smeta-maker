import ExcelJS from 'exceljs'
import { Request, Response, Router } from 'express'
import multer from 'multer'
import { unitAdapter } from '../utils/unitAdapter'

const router = Router()

const upload = multer({
	storage: multer.memoryStorage()
})

function getNumValue(cell: ExcelJS.Cell): number {
	const value = cell.value

	if (value && typeof value === 'object' && 'result' in value) {
		return Number(value.result) || 0
	}

	return Number(value) || 0
}

router.post(
	'/',
	upload.single('excel_file'),
	async (req: Request, res: Response) => {
		try {
			if (!req.file?.buffer) {
				return res.status(400).json({
					error: 'Файл не загружен',
					param: 'excel_file'
				})
			}

			const workbook = new ExcelJS.Workbook()

			await workbook.xlsx.load(Buffer.from(req.file.buffer) as any)

			const sheet = workbook.worksheets[0]

			if (!sheet) {
				return res.status(400).json({
					error: 'В файле нет листов'
				})
			}

			const places: Record<string, any[]> = {}

			let isEnd = false
			let transportCost: number | undefined
			let trashCost: number | undefined

			sheet.eachRow((row, rowNum) => {
				if (rowNum < 9 || isEnd) return

				const col1 = row.getCell(1).toString().trim()
				const col2 = row.getCell(2).toString().trim()

				// Общий итог сметы — заканчиваем импорт
				if (col2 === 'ИТОГО:') {
					isEnd = true
					return
				}

				// Промежуточный итог помещения — пропускаем строку
				if (/^ИТОГО:\s*\S+/i.test(col2)) {
					return
				}

				if (col2.includes('ТРАНСПОРТНЫЕ РАСХОДЫ')) {
					transportCost = getNumValue(row.getCell(5))
					return
				}

				if (
					col2.includes('ВЫНОС И УБОРКА МУСОРА') ||
					col2.includes('ВЫНОС, УБОРКА МУСОРА')
				) {
					trashCost = getNumValue(row.getCell(5))
					return
				}

				if (col1.length === 0) {
					if (col2) {
						places[col2] = []
					}
				} else {
					const keys = Object.keys(places)
					const lastPlace = keys[keys.length - 1]

					if (!lastPlace) return

					places[lastPlace].push({
						name: col2,
						price: getNumValue(row.getCell(5)),
						quantity: getNumValue(row.getCell(4)),
						unit: unitAdapter(row.getCell(3).toString())
					})
				}
			})

			const objectCell = sheet.getCell('C4').value

			const objectName =
				objectCell && typeof objectCell === 'object' && 'result' in objectCell
					? objectCell.result
					: objectCell

			return res.json({
				success: true,
				data: {
					object: objectName?.toString() || null,
					places,
					transportCost,
					trashCost
				}
			})
		} catch (err: unknown) {
			console.error(err)

			const message =
				err instanceof Error ? err.message : 'Не удалось прочитать смету'

			return res.status(500).json({ error: message })
		}
	}
)

export default router

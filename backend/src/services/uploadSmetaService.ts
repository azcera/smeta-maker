import ExcelJS from 'exceljs'
import { AppError } from '../utils/appError'
import { unitAdapter } from '../utils/unitAdapter'

function getNumValue(cell: ExcelJS.Cell): number {
	const value = cell.value

	if (value && typeof value === 'object' && 'result' in value) {
		return Number(value.result) || 0
	}

	return Number(value) || 0
}

export const uploadSmeta = async (file: Buffer) => {
	const workbook = new ExcelJS.Workbook()

	await workbook.xlsx.load(file as any)

	const sheet = workbook.worksheets[0]

	if (!sheet) {
		throw new AppError('В файле нет листов', 400)
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

		if (col2.includes('ТРАНСПОРТНЫЕ РАС')) {
			transportCost = getNumValue(row.getCell(5))
			return
		}

		if (col2.includes('УБОРКА МУСОРА')) {
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

	return {
		success: true,
		data: {
			object: objectName?.toString() || null,
			places,
			transportCost,
			trashCost
		}
	}
}

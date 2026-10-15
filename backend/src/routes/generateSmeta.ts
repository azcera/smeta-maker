import { Router, Request, Response } from 'express'
import ExcelJS from 'exceljs'
import slugify from 'slugify'

import { TEMPLATE_BASE64 } from '../templateBase64'
import { changeRowColor, setBorderRange, EXCEL_COLORS } from '../utils/excel'

const router = Router()

interface WorkItem {
	name: string
	unit: string
	quantity: number
	price: number
}

type Places = Record<string, WorkItem[]>

interface GenerateSmetaBody {
	object?: string
	places?: Places
	transportCost?: number
	trashCost?: number
}

router.post('/', async (req: Request, res: Response) => {
	try {
		const year = new Date().getFullYear()

		const {
			object,
			places = {},
			transportCost,
			trashCost
		} = req.body as GenerateSmetaBody

		if (!object) {
			throw new Error('Не передано или некорректное наименование объекта')
		}

		if (Object.entries(places).length === 0) {
			throw new Error('Добавляемые работы невозможно обработать')
		}

		const workbook = new ExcelJS.Workbook()

		await workbook.xlsx.load(Buffer.from(TEMPLATE_BASE64, 'base64') as any)

		const sheet = workbook.getWorksheet(1)

		if (!sheet) {
			throw new Error('Лист не найден в шаблоне')
		}

		// Шапка сметы
		sheet.getCell('C4').value = object

		const cellA6 = sheet.getCell('A6')

		if (typeof cellA6.value === 'string') {
			cellA6.value = cellA6.value.replace('ГОД', year.toString())
		}

		let currentRow = 9

		// Работы по помещениям
		for (const [placeName, works] of Object.entries(places)) {
			let num = 1

			const placeRow = sheet.getRow(currentRow)

			sheet.mergeCells(`B${currentRow}:F${currentRow}`)
			changeRowColor(placeRow, EXCEL_COLORS.lightBlue)

			const placeNameCell = placeRow.getCell(2)
			placeNameCell.value = placeName
			placeNameCell.alignment = {
				vertical: 'middle',
				horizontal: 'center'
			}
			placeNameCell.font = {
				bold: true,
				color: { argb: `FF${EXCEL_COLORS.white}` }
			}

			placeRow.commit()
			currentRow++

			for (const work of works) {
				const quantity = Number(work.quantity) || 0
				const price = Number(work.price) || 0
				const row = sheet.getRow(currentRow)

				row.getCell(1).value = num++
				row.getCell(2).value = work.name || ''
				row.getCell(3).value = work.unit || ''
				row.getCell(4).value = quantity
				row.getCell(5).value = price
				row.getCell(5).numFmt = '#,##0"р."'

				row.getCell(6).value = {
					formula: `D${currentRow}*E${currentRow}`
				}

				row.eachCell((cell, colNum) => {
					cell.alignment = {
						wrapText: true,
						horizontal: colNum === 2 ? 'left' : 'center',
						vertical: 'middle'
					}
				})

				row.commit()
				currentRow++
			}
		}

		// Дополнительные расходы
		if (transportCost || trashCost) {
			const row = sheet.getRow(currentRow)

			changeRowColor(row, EXCEL_COLORS.lightBlue)

			const descriptions: string[] = []
			let price = 0

			if (transportCost) {
				descriptions.push('ТРАНСПОРТНЫЕ РАСХОДЫ')
				price += Number(transportCost) || 0
			}

			if (trashCost) {
				descriptions.push('ВЫНОС, УБОРКА МУСОРА')
				price += Number(trashCost) || 0
			}

			row.getCell(2).value = descriptions.join(' И ')
			row.getCell(3).value = 'комплекс'
			row.getCell(4).value = 1
			row.getCell(5).value = price
			row.getCell(6).value = {
				formula: `D${currentRow}*E${currentRow}`
			}

			row.eachCell((cell, colNum) => {
				cell.alignment = {
					vertical: 'middle',
					horizontal: colNum === 2 ? 'left' : 'center',
					wrapText: true
				}
			})

			row.commit()
			currentRow++
		}

		// Итоговая строка
		const totalRow = sheet.getRow(currentRow)

		totalRow.font = { bold: true }
		changeRowColor(totalRow, EXCEL_COLORS.darkBlue)

		totalRow.getCell(2).value = 'ИТОГО:'
		totalRow.getCell(2).font = {
			bold: true,
			color: { argb: `FF${EXCEL_COLORS.white}` }
		}

		totalRow.getCell(6).value = {
			formula: `SUM(F9:F${currentRow - 1})`
		}

		totalRow.getCell(6).font = {
			bold: true,
			color: { argb: `FF${EXCEL_COLORS.white}` }
		}

		totalRow.commit()

		setBorderRange(sheet, 9, currentRow)

		// Примечание и согласие заказчика
		currentRow += 2

		sheet.getRow(currentRow).getCell(2).value =
			'Все дополнительные работы оговариваются с заказчиком и вносятся в смету.'

		sheet.getRow(currentRow).getCell(2).font = { bold: true }

		currentRow += 2

		sheet.getRow(currentRow).getCell(2).value =
			'Ознакомлен и согласен __________________________________________'

		// Размер шрифта
		sheet.eachRow((row, rowNum) => {
			if (rowNum <= 8) return

			row.eachCell(cell => {
				cell.font = { ...cell.font, size: 12 }
			})
		})

		// Параметры печати
		sheet.pageSetup.printArea = `A1:F${currentRow}`
		sheet.pageSetup.fitToPage = true
		sheet.pageSetup.fitToWidth = 1
		sheet.pageSetup.fitToHeight = 0
		sheet.pageSetup.orientation = 'portrait'
		sheet.pageSetup.paperSize = 9

		// Имя файла
		const safeName = slugify(object, {
			lower: true,
			strict: true,
			replacement: '_'
		}).substring(0, 40)

		const filename = `smeta_${safeName || 'document'}.xlsx`
		const xlsxBuffer = Buffer.from(await workbook.xlsx.writeBuffer())

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
			err instanceof Error ? err.message : 'Не удалось создать смету'

		return res.status(500).json({ error: message })
	}
})

export default router

import ExcelJS from 'exceljs'
import slugify from 'slugify'
import { TEMPLATE_BASE64 } from '../../../templateBase64'
import {
	applyRowAlignment,
	changeRowColor,
	EXCEL_COLORS,
	setBorderRange
} from '../../../utils/excel'
import type { GenerateSmetaBody } from './smeta.make.schema'

export const generateSmeta = async (body: GenerateSmetaBody) => {
	const year = new Date().getFullYear()

	const { object, places, transportCost, trashCost } = body

	const placeEntries = Object.entries(places)

	const hasMultiplePlaces = placeEntries.length > 1

	const totalParts: string[] = []
	const totals: number[] = []

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
	for (const [placeName, works] of placeEntries) {
		let num = 1
		let total = 0

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

		// Запоминаем начало диапазона работ помещения
		const workStartRow = currentRow

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

			total += quantity * price

			row.getCell(6).value = {
				formula: `D${currentRow}*E${currentRow}`,
				result: quantity * price
			}

			applyRowAlignment(row)

			row.commit()
			currentRow++
		}

		// Диапазон строк с работами текущего помещения
		totals.push(total)
		const workEndRow = currentRow - 1

		if (workEndRow >= workStartRow) {
			const workRange = `F${workStartRow}:F${workEndRow}`

			// Для одного помещения используем непосредственно работы.
			// Для нескольких помещений ниже добавим промежуточные итоги.
			if (!hasMultiplePlaces) {
				totalParts.push(workRange)
			}
		}

		// Промежуточный итог помещения нужен только при нескольких помещениях
		if (hasMultiplePlaces) {
			const subtotalRow = sheet.getRow(currentRow)

			// Применяем фон ко всем ячейкам строки A:F
			for (let col = 1; col <= 6; col++) {
				const cell = subtotalRow.getCell(col)

				cell.fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: { argb: 'FFC5D9F1' }
				}

				cell.font = {
					...cell.font,
					italic: true
				}
			}

			subtotalRow.getCell(2).value = `ИТОГО: ${placeName}`
			subtotalRow.getCell(2).font = {
				...subtotalRow.getCell(2).font,
				bold: true,
				italic: true
			}

			subtotalRow.getCell(6).value =
				workEndRow >= workStartRow
					? {
							formula: `SUM(F${workStartRow}:F${workEndRow})`,
							result: totals[totals.length - 1]
						}
					: 0

			subtotalRow.getCell(6).font = {
				...subtotalRow.getCell(6).font,
				bold: true,
				italic: true
			}

			subtotalRow.getCell(6).numFmt = '#,##0"р."'

			applyRowAlignment(subtotalRow, true)

			subtotalRow.commit()

			// Добавляем итог помещения в общий итог сметы
			totalParts.push(`F${currentRow}`)

			// Обязательно переходим на следующую строку
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
			formula: `D${currentRow}*E${currentRow}`,
			result: price
		}

		totals.push(price)

		applyRowAlignment(row)

		row.commit()
		totalParts.push(`F${currentRow}`)

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

	const total = totals.reduce((sum, v) => sum + v, 0)

	totalRow.getCell(6).value = {
		formula: totalParts.length ? `SUM(${totalParts.join(',')})` : '0',
		result: total
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

	return {
		xlsxBuffer,
		filename
	}
}

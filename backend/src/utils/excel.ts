import ExcelJS from 'exceljs'

export function changeRowColor(row: ExcelJS.Row, color: string): void {
	for (let col = 1; col <= 6; col++) {
		row.getCell(col).fill = {
			type: 'pattern',
			pattern: 'solid',
			fgColor: { argb: `FF${color}` }
		}
	}
}

export function setBorderRange(
	sheet: ExcelJS.Worksheet,
	startRow: number,
	endRow: number,
	startCol = 1,
	endCol = 6
): void {
	for (let rowNum = startRow; rowNum <= endRow; rowNum++) {
		const row = sheet.getRow(rowNum)

		for (let col = startCol; col <= endCol; col++) {
			row.getCell(col).border = {
				top: { style: 'thin' },
				left: { style: 'thin' },
				bottom: { style: 'thin' },
				right: { style: 'thin' }
			}
		}
	}
}

export const EXCEL_COLORS = {
	lightBlue: '95B3D7',
	white: 'FFFFFF',
	darkBlue: '31869B'
}

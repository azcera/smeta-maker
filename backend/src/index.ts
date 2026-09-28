import Database from 'better-sqlite3'
import cors from 'cors'
import ExcelJS from 'exceljs'
import express, { NextFunction, Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import { slugify } from 'transliteration'

const app = express()
const PORT = 3000
const LIST_TABLE = 'tula'

// Подключение к SQLite
const db = new Database(
	path.join(__dirname, '../resource/databases/regionru.db')
)

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Логирование
app.use('/api', (req: Request, res: Response, next: NextFunction) => {
	console.log(`${req.method} ${req.path}`)
	next()
})

// ========== Типы ==========

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
}

// ========== Получение списка ==========

app.get('/api/list', (req: Request, res: Response) => {
	try {
		const { category, id } = req.query
		let sql = `SELECT * FROM ${LIST_TABLE}`
		const params: (string | number)[] = []

		if (!id && category) {
			sql += ' WHERE LOWER(kategor) LIKE LOWER(?)'
			params.push(`%${category}%`)
		}

		if (id) {
			sql += ' WHERE _id = ?'
			params.push(Number(id))
		}

		const list = db.prepare(sql).all(...params)
		res.json(list)
	} catch (err: any) {
		res.status(500).json({ error: err.message })
	}
})

function changeRowColor(row: ExcelJS.Row, color: string) {
	for (let col = 1; col <= 6; col++) {
		row.getCell(col).fill = {
			type: 'pattern',
			pattern: 'solid',
			fgColor: { argb: `FF${color}` }
		}
	}
}

function setBorderRange(
	sheet: ExcelJS.Worksheet,
	startRow: number,
	endRow: number,
	startCol = 1,
	endCol = 6
) {
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

// colors
const lightBlueColor = '95B3D7'
const whiteColor = 'FFFFFF'
const darkBlueColor = '31869B'

// ========== Генерация сметы ==========

app.post('/api/generate-smeta', async (req: Request, res: Response) => {
	try {
		const year = new Date().getFullYear()

		const { object, places = {}, transportCost } = req.body as GenerateSmetaBody

		if (!object)
			throw new Error('Не передано или некорректное наименование объекта')

		if (Object.entries(places).length == 0)
			throw new Error('Добавляемые работы невозможно обработать')

		// Загружаем шаблон
		const workbook = new ExcelJS.Workbook()
		await workbook.xlsx.readFile(
			path.join(__dirname, '../resource/templates/template.xlsx')
		)

		const sheet = workbook.getWorksheet(1)
		if (!sheet) {
			throw new Error('Лист не найден в шаблоне')
		}

		// Шапка
		sheet.getCell('C4').value = object
		const cellA6 = sheet.getCell('A6')
		if (typeof cellA6.value === 'string') {
			cellA6.value = cellA6.value.replace('ГОД', year.toString())
		}

		// Заполнение работ
		let totalSum = 0
		let currentRow = 9

		for (const [placeName, works] of Object.entries(places)) {
			let num = 1
			// Название помещения
			const placeRow = sheet.getRow(currentRow)
			sheet.mergeCells(`B${currentRow}:F${currentRow}`)
			changeRowColor(placeRow, lightBlueColor)
			const placeNameCell = placeRow.getCell(2)
			placeNameCell.value = placeName
			placeNameCell.alignment = {
				vertical: 'middle',
				horizontal: 'center'
			}
			placeNameCell.font = { bold: true, color: { argb: `FF${whiteColor}` } }
			placeRow.commit()
			currentRow++

			// Работы внутри помещения
			for (const work of works) {
				const qty = Number(work.quantity) || 0
				const name = work.name || ''
				const price = Number(work.price) || 0
				const sum = qty * price
				totalSum += sum

				const row = sheet.getRow(currentRow)

				row.getCell(1).value = num++
				row.getCell(2).value = name
				row.getCell(3).value = work.unit || ''

				row.getCell(4).value = qty
				row.getCell(5).value = price
				row.getCell(6).value = {
					formula: `D${currentRow}*E${currentRow}`,
					result: sum
				}
				row.eachCell((cell, num) => {
					cell.alignment = {
						wrapText: true,
						horizontal: num == 2 ? 'left' : 'center',
						vertical: 'middle'
					}
				})
				row.commit()

				currentRow++
			}
		}

		// Транспортные расходы
		if (transportCost) {
			const transportRow = sheet.getRow(currentRow)
			changeRowColor(transportRow, lightBlueColor)
			transportRow.getCell(2).value = 'ТРАНСПОРТНЫЕ РАСХОДЫ'
			transportRow.getCell(3).value = 'комплекс'

			transportRow.getCell(4).value = 1

			transportRow.getCell(5).value = transportCost
			transportRow.getCell(6).value = transportCost
			transportRow.eachCell((cell, num) => {
				cell.alignment = {
					vertical: 'middle',
					horizontal: num == 2 ? 'left' : 'center',
					wrapText: true
				}
			})
			transportRow.commit()
			totalSum += Number(transportCost) || 0
			currentRow++
		}

		// Итого
		const totalRow = sheet.getRow(currentRow)
		totalRow.font = { bold: true }
		changeRowColor(totalRow, darkBlueColor)
		totalRow.getCell(2).value = 'ИТОГО:'
		totalRow.getCell(2).font = {
			bold: true,
			color: { argb: `FF${whiteColor}` }
		}
		totalRow.getCell(6).value = {
			formula: `SUM(F9:F${currentRow - 1})`,
			result: totalSum
		}
		totalRow.getCell(6).font = {
			bold: true,
			color: { argb: `FF${whiteColor}` }
		}
		totalRow.commit()

		setBorderRange(sheet, 9, currentRow)

		// === Примечание ===
		currentRow += 2
		const dopsCell = sheet.getRow(currentRow).getCell(2)
		dopsCell.value =
			'Все дополнительные работы оговариваются с заказчиком и вносятся в смету.'
		dopsCell.font = { bold: true }

		currentRow += 2
		const agreeCell = sheet.getRow(currentRow).getCell(2)
		agreeCell.value =
			'Ознакомлен и согласен _______________________________________________'

		sheet.eachRow((row, num) => {
			if (num <= 8) return
			row.eachCell(cell => (cell.font = { ...cell.font, size: 12 }))
		})

		sheet.pageSetup.printArea = `A1:F${currentRow}`
		sheet.pageSetup.fitToPage = true
		sheet.pageSetup.fitToWidth = 1
		sheet.pageSetup.fitToHeight = 0
		sheet.pageSetup.orientation = 'portrait'
		sheet.pageSetup.paperSize = 9 // A4

		// Отдаём файл
		const safeName = slugify(object, {
			lowercase: true,
			separator: '_'
		}).substring(0, 40)

		const filename = `smeta_${safeName || 'document'}.xlsx`

		res.setHeader(
			'Content-Type',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		)
		res.setHeader(
			'Content-Disposition',
			`attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`
		)

		await workbook.xlsx.write(res)
		res.end()
	} catch (err: any) {
		console.error(err)
		res.status(500).json({ error: err.message })
	}
})

// ========== Парсинг сметы ==========
app.post(
	'/api/upload-smeta',
	upload.single('excel_file'),
	async (req: Request, res: Response) => {
		try {
			if (!req.file || !req.file.buffer) {
				return res.status(400).json({ error: 'Файл не загружен' })
			}

			// Создаем чистый Node.js Buffer
			const fileBuffer = Buffer.from(req.file.buffer)

			const workbook = new ExcelJS.Workbook()
			await workbook.xlsx.load(fileBuffer as any)

			const sheet = workbook.worksheets[0]

			res.json({
				success: true,
				data: []
			})
		} catch (err: any) {
			console.error(err)
			res.status(500).json({ error: err.message })
		}
	}
)

// ========== Запуск ==========
app.listen(PORT, () => {
	console.log(`Сервер запущен на http://localhost:${PORT}`)
})

import { createClient } from '@supabase/supabase-js'
import cors from 'cors'
import dotenv from 'dotenv'
import ExcelJS from 'exceljs'
import express, { NextFunction, Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import serverless from 'serverless-http'
import slugify from 'slugify'
import { TEMPLATE_BASE64 } from './templateBase64'

if (process.env.NODE_ENV !== 'production') {
	dotenv.config({
		path: path.resolve(__dirname, '../../.env')
	})
} else {
	dotenv.config()
}
const app = express()
const PORT = process.env.PORT || 3000
const LIST_TABLE = 'tula'

// ========== Supabase ==========
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey =
	process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY

const supabase =
	supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

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
	trashCost?: number
}

// ========== Получение списка ==========

app.get('/api/list', async (req: Request, res: Response) => {
	try {
		const { category, id } = req.query
		if (!supabase) {
			return res.status(500).json({
				error: 'Supabase не настроен: задайте SUPABASE_URL и ключ в Vercel'
			})
		}
		let query = supabase.from(LIST_TABLE).select('*')

		if (id) {
			query = query.eq('_id', Number(id))
		} else if (category) {
			// ilike — регистронезависимый поиск (аналог LOWER(...) LIKE LOWER(...))
			query = query.ilike('kategor', `%${category}%`)
		}

		const { data: list, error } = await query

		if (error) {
			throw error
		}

		res.json(list ?? [])
	} catch (err: any) {
		console.error(err)
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

		const {
			object,
			places = {},
			transportCost,
			trashCost
		} = req.body as GenerateSmetaBody

		if (!object)
			throw new Error('Не передано или некорректное наименование объекта')

		if (Object.entries(places).length == 0)
			throw new Error('Добавляемые работы невозможно обработать')

		// Загружаем шаблон
		const workbook = new ExcelJS.Workbook()
		await workbook.xlsx.load(Buffer.from(TEMPLATE_BASE64, 'base64') as any)

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
				row.getCell(5).numFmt = '#,##0"р."'
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

		if (trashCost) {
			const trashRow = sheet.getRow(currentRow)
			changeRowColor(trashRow, lightBlueColor)
			trashRow.getCell(2).value = 'ВЫНОС И УБОРКА МУСОРА'
			trashRow.getCell(3).value = 'комплекс'

			trashRow.getCell(4).value = 1

			trashRow.getCell(5).value = trashCost
			trashRow.getCell(6).value = trashCost
			trashRow.eachCell((cell, num) => {
				cell.alignment = {
					vertical: 'middle',
					horizontal: num == 2 ? 'left' : 'center',
					wrapText: true
				}
			})
			trashRow.commit()
			totalSum += Number(trashCost) || 0
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
			lower: true,
			strict: true,
			replacement: '_'
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

		res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition')

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
				return res
					.status(400)
					.json({ error: 'Файл не загружен', param: req.file || 'нет' })
			}

			const fileBuffer = Buffer.from(req.file.buffer)
			const workbook = new ExcelJS.Workbook()
			await workbook.xlsx.load(fileBuffer as any)

			const sheet = workbook.worksheets[0]
			if (!sheet) {
				return res.status(400).json({ error: 'В файле нет листов' })
			}

			let places: Record<string, any[]> = {}
			let isEnd = false
			let transportCost: number | undefined = undefined
			let trashCost: number | undefined = undefined

			const getNumValue = (cell: ExcelJS.Cell): number => {
				const val = cell.value
				if (val && typeof val === 'object' && 'result' in val) {
					return Number(val.result) || 0
				}
				return Number(val) || 0
			}

			sheet.eachRow((row, num) => {
				if (num < 9 || isEnd) return

				const col1 = row.getCell(1).toString().trim()
				const col2 = row.getCell(2).toString().trim()

				if (col2.includes('ИТОГО:')) {
					isEnd = true
					return
				}
				if (col2.includes('ТРАНСПОРТНЫЕ РАСХОДЫ')) {
					isEnd = true
					transportCost = getNumValue(row.getCell(5))
					return
				}
				if (col2.includes('ВЫНОС И УБОРКА МУСОРА')) {
					isEnd = true
					trashCost = getNumValue(row.getCell(5))
					return
				}

				if (col1.length === 0) {
					if (col2) {
						// Создаем место, только если имя не пустое
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
						unit: row.getCell(3).toString()
					})
				}
			})

			const c4Cell = sheet.getCell('C4')
			const objectName =
				c4Cell.value &&
				typeof c4Cell.value === 'object' &&
				'result' in c4Cell.value
					? c4Cell.value.result
					: c4Cell.value

			res.json({
				success: true,
				data: {
					object: objectName?.toString() || null,
					places,
					transportCost,
					trashCost
				}
			})
		} catch (err: any) {
			console.error(err)
			res.status(500).json({ error: err.message })
		}
	}
)

// ========== Запуск ==========
const serverlessHandler = serverless(app) // без basePath

export const handler = (event: any, context: any) => {
	// Yandex Gateway кладёт реальный путь в event.url
	const realPath = (event.url || event.path || '/').replace(/\?.*/, '') // убираем query string

	const patchedEvent = {
		...event,
		path: realPath,
		// на всякий случай
		requestContext: {
			...event.requestContext,
			path: realPath
		}
	}

	return serverlessHandler(patchedEvent, context)
}

// 2. Локальный запуск (сработает ТОЛЬКО на вашем компьютере)
if (process.env.NODE_ENV !== 'production') {
	app.listen(Number(PORT), '0.0.0.0', () => {
		console.log(`[Local] Сервер запущен на http://localhost:${PORT}`)
	})
}

import { Router } from 'express'
import multer from 'multer'
import {
	getSmetaController,
	uploadSmetaController
} from '../controllers/smetaController'

const smetaRouter = Router()

const upload = multer({
	storage: multer.memoryStorage()
})

smetaRouter.get('/smeta', upload.single('excel_file'), uploadSmetaController) // генерация сметы в файл (экспорт)
smetaRouter.post('/smeta', getSmetaController) // преобразование сметы из файла (импорт)

export { smetaRouter }

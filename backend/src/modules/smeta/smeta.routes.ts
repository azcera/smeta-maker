import { Router } from 'express'
import multer from 'multer'
import { importSmeta } from './import/smeta.import.controller'
import { makeSmeta } from './make/smeta.make.controller'

const smetaRouter = Router()

const upload = multer({
	storage: multer.memoryStorage()
})
// генерация сметы в файл (экспорт)
smetaRouter.post('/make-smeta', upload.single('excel_file'), makeSmeta)
// преобразование сметы из файла (импорт)
smetaRouter.post('/import-smeta', importSmeta)

export { smetaRouter }

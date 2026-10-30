import { Router } from 'express'
import {
	getLastUpdate,
	getUnits,
	getWorks
} from '../controllers/listsController'

const listsRouter = Router()

listsRouter.get('/works', getWorks) // получение списка работ
listsRouter.get('/units', getUnits) // получение списка единиц измерения
listsRouter.get('/last-update', getLastUpdate) // получение последнего времени обновления

export { listsRouter }

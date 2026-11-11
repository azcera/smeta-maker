import { Router } from 'express'
import { getLastUpdate } from './last-update/lists.last-update.controller'
import { getUnits } from './units/lists.units.controller'
import { getWorks } from './works/lists.works.controller'

const listsRouter = Router()

listsRouter.get('/works', getWorks) // получение списка работ
listsRouter.get('/units', getUnits) // получение списка единиц измерения
listsRouter.get('/last-update', getLastUpdate) // получение последнего времени обновления

export { listsRouter }

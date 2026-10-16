import { Request, Response, Router } from 'express'
import { dbUnits } from '../utils/unitAdapter'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
	return res.json(Object.keys(dbUnits))
})

export default router

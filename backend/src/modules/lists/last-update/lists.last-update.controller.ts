import { Request, Response } from 'express'
import { fetchLastUpdate } from './lists.last-update.service'
import { asyncHandler } from '../../../utils/asyncHandler'

export const getLastUpdate = asyncHandler(
	async (_req: Request, res: Response) => {
		const data = await fetchLastUpdate()
		res.json(data)
	}
)

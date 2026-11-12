import { Request, Response } from 'express'
import { asyncHandler } from '../../../utils/asyncHandler'
import { fetchLastUpdate } from './lists.last-update.service'

export const getLastUpdate = asyncHandler(
	async (_req: Request, res: Response) => {
		const data = await fetchLastUpdate()
		return res.json(data)
	}
)

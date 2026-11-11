import { Request, Response } from 'express'
import { fetchUnits } from './lists.units.service'
import { asyncHandler } from '../../../utils/asyncHandler'

export const getUnits = asyncHandler(async (_req: Request, res: Response) => {
	const data = await fetchUnits()
	res.json(data ?? [])
})

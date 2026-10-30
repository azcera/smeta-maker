import { Request, Response } from 'express'
import {
	fetchLastUpdate,
	fetchUnits,
	fetchWorks
} from '../services/listsService'

export const getWorks = async (req: Request, res: Response) => {
	try {
		const data = await fetchWorks(req.query)
		return res.json(data ?? [])
	} catch (err: unknown) {
		console.error(err)

		const message =
			err instanceof Error ? err.message : 'Не удалось получить список работ'

		return res.status(500).json({ error: message })
	}
}

export async function getUnits(req: Request, res: Response) {
	try {
		const data = await fetchUnits()
		return res.json(data ?? [])
	} catch (err: unknown) {
		console.error(err)

		const message =
			err instanceof Error
				? err.message
				: 'Не удалось получить список единиц измерения'

		return res.status(500).json({ error: message })
	}
}
export async function getLastUpdate(req: Request, res: Response) {
	try {
		const data = await fetchLastUpdate()
		return res.json(data ?? [])
	} catch (err: unknown) {
		console.error(err)

		const message =
			err instanceof Error
				? err.message
				: 'Не удалось получить список единиц измерения'

		return res.status(500).json({ error: message })
	}
}

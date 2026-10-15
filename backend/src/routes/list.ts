import { Router, Request, Response } from 'express'
import { supabase, LIST_TABLE } from '../config/supabase'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
	try {
		const { category, id } = req.query

		if (!supabase) {
			return res.status(500).json({
				error: 'Supabase не настроен: задайте SUPABASE_URL и ключ в окружении'
			})
		}

		let query = supabase.from(LIST_TABLE).select('*')

		if (id) {
			query = query.eq('_id', Number(id))
		} else if (category) {
			query = query.ilike('kategor', `%${String(category)}%`)
		}

		const { data, error } = await query

		if (error) {
			throw error
		}

		return res.json(data ?? [])
	} catch (err: unknown) {
		console.error(err)

		const message =
			err instanceof Error ? err.message : 'Не удалось получить список'

		return res.status(500).json({ error: message })
	}
})

export default router

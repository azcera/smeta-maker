import { Request, Response, Router } from 'express'
import { LIST_TABLE, supabase } from '../config/supabase'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
	try {
		if (!supabase) {
			return res.status(500).json({
				error: 'Supabase не настроен: задайте SUPABASE_URL и ключ в окружении'
			})
		}

		let query = supabase
			.from(LIST_TABLE)
			.select('updated_at')
			.not('updated_at', 'is', null)
			.order('updated_at', { ascending: false })
			.limit(1)

		const { data, error } = await query

		if (error) {
			throw error
		}

		return res.json(data[0] ?? [])
	} catch (err: unknown) {
		console.error(err)

		const message =
			err instanceof Error
				? err.message
				: 'Не удалось получить последнее время обновления'

		return res.status(500).json({ error: message })
	}
})

export default router

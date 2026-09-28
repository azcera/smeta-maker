import type { DbWork, NormalizedWork } from '../types'

const API_URL = 'http://localhost:3000/api'

/** Получить все работы из БД */
export async function fetchWorks(): Promise<DbWork[]> {
	const res = await fetch(`${API_URL}/list`)
	if (!res.ok) {
		throw new Error('Не удалось загрузить список работ')
	}
	const data = await res.json()
	return Array.isArray(data) ? data : []
}

/** Нормализация одной работы */
export function normalizeDbWork(item: DbWork): NormalizedWork {
	return {
		id: item._id,
		name: item.vid || 'Без названия',
		unit: item.izmer || 'шт',
		price: Number(item.price) || 0,
		category: item.kategor || ''
	}
}

/** Получить уникальные единицы измерения */
export async function fetchUnits(): Promise<string[]> {
	const works = await fetchWorks()
	const units = new Set<string>()

	works.forEach(w => {
		if (w.izmer && typeof w.izmer === 'string') {
			units.add(w.izmer.trim())
		}
	})

	return Array.from(units).sort()
}

export async function generateSmeta(payload: {
	object: string
	places: Record<
		string,
		{ name: string; unit: string; quantity: number; price: number }[]
	>
	transportCost?: number
}) {
	const res = await fetch(`${API_URL}/generate-smeta`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload)
	})

	if (!res.ok) {
		const err = await res.json().catch(() => ({}))
		throw new Error(err.error || 'Ошибка генерации сметы')
	}

	const blob = await res.blob()
	return blob
}

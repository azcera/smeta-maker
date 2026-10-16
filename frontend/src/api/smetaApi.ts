import { useSmetaStore } from '../store/smetaStore'
import type { DbWork, NormalizedWork } from '../types'
import { normalizeUnit } from '../utils/normalizeUnit'

const API_URL = import.meta.env.VITE_API_URL

/** Получить все работы из БД */
export async function fetchWorks(): Promise<{
	works: DbWork[]
	units: string[]
}> {
	const res = await fetch(`${API_URL}/list`)
	if (!res.ok) {
		throw new Error('Не удалось загрузить список работ')
	}
	const data = await res.json()
	const works = Array.isArray(data) ? data : []
	const units = new Set<string>()
	works.forEach(w => {
		if (w.izmer && typeof w.izmer === 'string') {
			units.add(w.izmer.trim())
		}
	})

	return {
		works: works,
		units: Array.from(units).sort()
	}
}

/** Нормализация одной работы */
export function normalizeDbWork(item: DbWork): NormalizedWork {
	return {
		id: item._id,
		name: item.vid || 'Без названия',
		unit: normalizeUnit(item.izmer) || 'шт.',
		price: Number(item.price) || 0,
		category: item.kategor || ''
	}
}

// if true => last time update
export async function getLastUpdateTime(): Promise<number | null> {
	const res = await fetch(`${API_URL}/get-update-time`)

	if (!res.ok) {
		throw new Error('Не удалось загрузить время обновления')
	}

	const data = await res.json()

	if (!data || Array.isArray(data) || !data.updated_at) {
		return null
	}

	const serverTime = new Date(data.updated_at).getTime()

	if (!Number.isFinite(serverTime)) {
		throw new Error('Не удалось прочитать время обновления')
	}

	const { dbUpdateTime } = useSmetaStore.getState()

	// Если локального времени нет или серверная база новее
	if (dbUpdateTime === null || serverTime > dbUpdateTime) {
		return serverTime
	}

	return null
}

export async function generateSmeta(payload: {
	object: string
	places: Record<
		string,
		{ name: string; unit: string; quantity: number; price: number }[]
	>
	transportCost?: number
	trashCost?: number
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

	return new Blob([blob], {
		type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
	})
}

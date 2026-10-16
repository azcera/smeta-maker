export const dbUnits = {
	'м.п.': ['м/п'],
	'м²': ['м2'],
	'м³': ['м3'],
	'см.п.': ['см/п'],
	'тч.': ['тч'],
	'шт.': ['шт']
}

export function unitAdapter(unit: string): string {
	const normalizedUnit = unit.trim()

	for (const [key, aliases] of Object.entries(dbUnits)) {
		if (aliases.includes(normalizedUnit)) {
			return key
		}
	}

	return normalizedUnit
}

interface UnitProp {
	dark: string
	light: string
}

const UNIT_COLORS: Record<string, UnitProp> = {
	'м.п.': {
		dark: '#423461',
		light: '#a589e3'
	},
	'м²': {
		dark: '#34615e',
		light: '#68bfb9'
	},
	'м³': {
		dark: '#34615e',
		light: '#68bfb9'
	},
	'см.п.': {
		dark: '#613434',
		light: '#d57c7c'
	},
	'тч.': {
		dark: '#61345e',
		light: '#bb67b6'
	},
	'шт.': {
		dark: '#686868',
		light: '#b5b5b5'
	},
	комплекс: {
		dark: '#4b6134',
		light: '#9abd75'
	},
	'?': {
		dark: '#615034',
		light: '#c7a978'
	}
}

interface Props {
	isDark?: boolean
}

export function getUnitColor(unit: string, { isDark }: Props = {}) {
	const key = unit.toLowerCase().trim()
	const unitColor = UNIT_COLORS[key] || UNIT_COLORS['?']
	return isDark ? unitColor.dark : unitColor.light
}

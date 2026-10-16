export function normalizeUnit(unit: string) {
	return unit.trim().replace(/м2/g, 'м²').replace(/м3/g, 'м³')
}

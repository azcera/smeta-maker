export interface Work {
	id: string
	name: string
	unit: string
	quantity: number
	price: number
	fromDb?: boolean
}

export interface Place {
	id: string
	name: string
	works: Work[]
}

export interface DbWork {
	_id: number
	vid: string
	price: string | number
	izmer: string
	kategor: string
}

export interface NormalizedWork {
	id: number
	name: string
	unit: string
	price: number
	category: string
}

export interface WorkItem {
	name: string
	unit: string
	quantity: number
	price: number
}

export type PlacesArray = Record<string, WorkItem[]>

export interface UploadResponse {
	success: boolean
	data: {
		object: string | null
		places: PlacesArray
		transportCost?: number
	}
	error?: string
}

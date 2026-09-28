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

import { nanoid } from 'nanoid'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { fetchWorks, normalizeDbWork } from '../api/smetaApi'
import type { NormalizedWork, Place, PlacesArray, Work } from '../types'

export type ViewTypes = 'TOTAL' | 'QUANTITY'

interface SmetaStore {
	objectName: string
	places: Place[]
	transportCost: number
	trashCost: number
	isDark: boolean
	isTransportCost: boolean
	isTrashCost: boolean
	importedTable: string | null
	viewType: ViewTypes
	dbWorks: NormalizedWork[]
	dbWorksLoaded: boolean
	isMultiplePlaces: boolean

	loadDbWorks: () => Promise<void>
	setObjectName: (name: string) => void
	setTransportCost: (value: number) => void
	setTrashCost: (value: number) => void
	setDark: (value: boolean) => void
	setImportedTable: (value: string) => void
	setIsTransportCost: (value: boolean) => void
	setIsTrashCost: (value: boolean) => void
	setViewType: (value: ViewTypes) => void
	setIsMultiplePlaces: (value: boolean) => void

	addPlace: (name: string) => string // возвращает id
	removePlace: (placeId: string) => void
	renamePlace: (placeId: string, name: string) => void

	addWork: (placeId: string, work: Omit<Work, 'id'>) => void
	updateWork: (placeId: string, workId: string, data: Partial<Work>) => void
	removeWork: (placeId: string, workId: string) => void
	addParsedWorks: (parsedWorks: PlacesArray) => void
	clearAll: () => void
}

export const useSmetaStore = create<SmetaStore>()(
	persist(
		(set, get) => ({
			objectName: '',
			places: [],
			transportCost: 10000,
			trashCost: 10000,
			isDark: true,
			isTransportCost: false,
			isTrashCost: false,
			importedTable: null,
			viewType: 'TOTAL',
			dbWorks: [],
			dbWorksLoaded: false,
			isMultiplePlaces: false,

			loadDbWorks: async () => {
				if (get().dbWorksLoaded) return // уже загружено — выходим

				try {
					const raw = await fetchWorks()
					const normalized = raw.map(normalizeDbWork)
					set({
						dbWorks: normalized,
						dbWorksLoaded: true
					})
				} catch (err) {
					console.error('Не удалось загрузить базу работ', err)
				}
			},
			setObjectName: name => set({ objectName: name }),
			setTransportCost: value => set({ transportCost: value }),
			setTrashCost: value => set({ trashCost: value }),
			setDark: value => set({ isDark: value }),
			setImportedTable: value => set({ importedTable: value }),

			setIsMultiplePlaces: value => {
				set({
					isMultiplePlaces: value
				})
			},
			setIsTransportCost: value =>
				set({
					isTransportCost: value
				}),

			setIsTrashCost: value =>
				set({
					isTrashCost: value
				}),

			setViewType(value) {
				set({
					viewType: value
				})
			},

			addPlace: name => {
				const id = nanoid()
				set(state => ({
					places: [...state.places, { id, name, works: [] }],
					importedTable: null
				}))
				return id
			},

			removePlace: placeId =>
				set(state => ({
					places: state.places.filter(p => p.id !== placeId),
					importedTable: null
				})),

			renamePlace: (placeId, name) =>
				set(state => ({
					places: state.places.map(p =>
						p.id === placeId ? { ...p, name } : p
					),
					importedTable: null
				})),

			addWork: (placeId, work) =>
				set(state => ({
					places: state.places.map(p =>
						p.id === placeId
							? {
									...p,
									works: [...p.works, { ...work, id: nanoid() }]
								}
							: p
					),
					importedTable: null
				})),

			addParsedWorks: parsedWorks => {
				let arrayPlace: Place[] = []
				Object.entries(parsedWorks).forEach(place =>
					arrayPlace.push({
						id: nanoid(),
						name: place[0],
						works: place[1].map(item => {
							return {
								id: nanoid(),
								name: item.name,
								price: item.price,
								quantity: item.quantity,
								unit: item.unit
							}
						})
					})
				)
				set({
					places: arrayPlace
				})
			},

			updateWork: (placeId, workId, data) =>
				set(state => ({
					places: state.places.map(p =>
						p.id === placeId
							? {
									...p,
									works: p.works.map(w =>
										w.id === workId ? { ...w, ...data } : w
									)
								}
							: p
					),
					importedTable: null
				})),

			removeWork: (placeId, workId) =>
				set(state => ({
					places: state.places.map(p =>
						p.id === placeId
							? { ...p, works: p.works.filter(w => w.id !== workId) }
							: p
					),
					importedTable: null
				})),

			clearAll: () =>
				set({
					places: [],
					transportCost: 0,
					trashCost: 0,
					isTransportCost: false,
					isTrashCost: false,
					objectName: '',
					importedTable: null
				})
		}),

		{
			name: 'smeta-storage',
			partialize: state => ({
				objectName: state.objectName,
				places: state.places,
				transportCost: state.transportCost,
				isDark: state.isDark,
				importedTable: state.importedTable,
				isTransportCost: state.isTransportCost,
				trashCost: state.trashCost,
				isTrashCost: state.isTrashCost,
				viewType: state.viewType,
				dbWorks: state.dbWorks,
				dbWorksLoaded: state.dbWorksLoaded,
				isMultiplePlaces: state.isMultiplePlaces
			})
		}
	)
)

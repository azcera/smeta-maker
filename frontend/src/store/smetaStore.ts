import { nanoid } from 'nanoid'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { fetchWorks, normalizeDbWork } from '../api/smetaApi'
import type { NormalizedWork, Place, PlacesArray, Work } from '../types'

export type ViewTypes = 'TOTAL' | 'QUANTITY'

interface SmetaStore {
	objectName: string
	setObjectName: (name: string) => void

	transportCost: number
	setTransportCost: (value: number) => void

	trashCost: number
	setTrashCost: (value: number) => void

	isDark: boolean
	setDark: (value: boolean) => void

	isTransportCost: boolean
	setIsTransportCost: (value: boolean) => void

	isTrashCost: boolean
	setIsTrashCost: (value: boolean) => void

	importedTable: string | null
	setImportedTable: (value: string) => void

	viewType: ViewTypes
	setViewType: (value: ViewTypes) => void

	places: Place[]
	addPlace: (name: string) => string // возвращает id
	removePlace: (placeId: string) => void
	renamePlace: (placeId: string, name: string) => void

	dbWorks: NormalizedWork[]
	dbWorksLoaded: boolean
	loadDbWorks: () => Promise<void>
	addWork: (placeId: string, work: Omit<Work, 'id'>) => void
	updateWork: (placeId: string, workId: string, data: Partial<Work>) => void
	removeWork: (placeId: string, workId: string) => void
	addParsedWorks: (parsedWorks: PlacesArray) => void

	isSearchMethod: boolean
	setIsSearchMethod: (value: boolean) => void

	isReorder: boolean
	setIsReorder: (value: boolean) => void

	reorderWork: (placeId: string, oldIndex: number, newIndex: number) => void

	clearAll: () => void
}

export const useSmetaStore = create<SmetaStore>()(
	persist(
		(set, get) => ({
			objectName: '',
			setObjectName: name => set({ objectName: name }),

			transportCost: 10000,
			setTransportCost: value => set({ transportCost: value }),

			trashCost: 10000,
			setTrashCost: value => set({ trashCost: value }),

			isDark: true,
			setDark: value => set({ isDark: value }),

			isTransportCost: false,
			setIsTransportCost: value =>
				set({
					isTransportCost: value
				}),

			isTrashCost: false,
			setIsTrashCost: value =>
				set({
					isTrashCost: value
				}),

			importedTable: null,
			setImportedTable: value => set({ importedTable: value }),

			viewType: 'TOTAL',
			setViewType(value) {
				set({
					viewType: value
				})
			},

			places: [],
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

			isReorder: false,
			setIsReorder: value => set({ isReorder: value }),

			dbWorks: [],
			dbWorksLoaded: false,
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

			reorderWork: (placeId, oldIndex, newIndex) =>
				set(state => {
					const places = state.places.map(place => {
						if (place.id !== placeId) return place

						const works = [...place.works]
						const [moved] = works.splice(oldIndex, 1)
						works.splice(newIndex, 0, moved)

						return { ...place, works }
					})

					return { places, importedTable: null }
				}),

			isSearchMethod: true,
			setIsSearchMethod: value => set({ isSearchMethod: value }),

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
				isSearchMethod: state.isSearchMethod
			})
		}
	)
)

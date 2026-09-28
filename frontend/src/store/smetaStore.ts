import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type Place, type Work } from '../types'

interface SmetaStore {
	objectName: string
	places: Place[]
	transportCost: number
	isDark: boolean

	setObjectName: (name: string) => void
	setTransportCost: (value: number) => void
	setDark: (value: boolean) => void

	addPlace: (name: string) => string // возвращает id
	removePlace: (placeId: string) => void
	renamePlace: (placeId: string, name: string) => void

	addWork: (placeId: string, work: Omit<Work, 'id'>) => void
	updateWork: (placeId: string, workId: string, data: Partial<Work>) => void
	removeWork: (placeId: string, workId: string) => void

	clearAll: () => void
}

export const useSmetaStore = create<SmetaStore>()(
	persist(
		set => ({
			objectName: '',
			places: [],
			transportCost: 0,
			isDark: true,

			setObjectName: name => set({ objectName: name }),
			setTransportCost: value => set({ transportCost: value }),
			setDark: value => set({ isDark: value }),

			addPlace: name => {
				const id = crypto.randomUUID()
				set(state => ({
					places: [...state.places, { id, name, works: [] }]
				}))
				return id
			},

			removePlace: placeId =>
				set(state => ({
					places: state.places.filter(p => p.id !== placeId)
				})),

			renamePlace: (placeId, name) =>
				set(state => ({
					places: state.places.map(p => (p.id === placeId ? { ...p, name } : p))
				})),

			addWork: (placeId, work) =>
				set(state => ({
					places: state.places.map(p =>
						p.id === placeId
							? {
									...p,
									works: [...p.works, { ...work, id: crypto.randomUUID() }]
								}
							: p
					)
				})),

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
					)
				})),

			removeWork: (placeId, workId) =>
				set(state => ({
					places: state.places.map(p =>
						p.id === placeId
							? { ...p, works: p.works.filter(w => w.id !== workId) }
							: p
					)
				})),

			clearAll: () => set({ places: [], transportCost: 0 })
		}),
		{
			name: 'smeta-storage',
			partialize: state => ({
				objectName: state.objectName,
				places: state.places,
				transportCost: state.transportCost,
				isDark: state.isDark
			})
		}
	)
)

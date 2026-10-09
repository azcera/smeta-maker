import {
	closestCenter,
	DndContext,
	DragOverlay,
	PointerSensor,
	TouchSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
	type DragStartEvent
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Eye, EyeClosed, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import Modal from '../../../components/Modal'
import PlaceModal from '../../../components/PlaceModal'
import { useSmetaStore } from '../../../store/smetaStore'
import type { Place, Work } from '../../../types'
import WorkItem from './WorksItem'

interface PlaceListProps {
	places: Place[]
	isDark: boolean
	onRemovePlace: (id: string) => void
	onAddWorkClick: (placeId: string) => void
}

export function PlaceList({
	places,
	isDark,
	onRemovePlace,
	onAddWorkClick
}: PlaceListProps) {
	const { isReorder, reorderWork } = useSmetaStore()

	const [collapsedIds, setCollapsedIds] = useState<string[]>([])
	const [isDeleteModal, setIsDeleteModal] = useState(false)
	const [isPlaceEditModal, setIsPlaceEditModal] = useState(false)
	const [editingPlace, setEditingPlace] = useState<Place | undefined>()

	const [activeWork, setActiveWork] = useState<{
		place: Place
		work: Work
	} | null>(null)

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 8 }
		}),
		useSensor(TouchSensor, {
			activationConstraint: { delay: 120, tolerance: 8 }
		})
	)

	const handleDragStart = (event: DragStartEvent) => {
		const { active } = event
		const workId = active.id as string

		for (const place of places) {
			const work = place.works.find(w => w.id === workId)
			if (work) {
				setActiveWork({ place, work })
				break
			}
		}
	}

	const handleDragEnd = (event: DragEndEvent, placeId: string) => {
		const { active, over } = event
		setActiveWork(null) // убираем оверлей

		if (!over || active.id === over.id) return

		const place = places.find(p => p.id === placeId)
		if (!place) return

		const oldIndex = place.works.findIndex(w => w.id === active.id)
		const newIndex = place.works.findIndex(w => w.id === over.id)

		if (oldIndex !== -1 && newIndex !== -1) {
			reorderWork(placeId, oldIndex, newIndex)
		}
	}

	if (places.length === 0) {
		return (
			<div
				className={`text-center py-20 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}
			>
				<p className='text-lg'>Помещений пока нет</p>
				<p className='text-sm mt-2'>Добавьте первое помещение</p>
			</div>
		)
	}

	const toggleCollapse = (id: string) => {
		setCollapsedIds(prev =>
			prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
		)
	}

	const showModalPlace = (place: Place, action: 'DELETE' | 'EDIT') => {
		setEditingPlace(place)
		if (action === 'DELETE') {
			setIsDeleteModal(true)
		} else {
			setIsPlaceEditModal(true)
		}
	}

	return (
		<>
			{places.map(place => {
				const isCollapsed = collapsedIds.includes(place.id)

				return (
					<div
						key={place.id}
						className='w-full max-w-md space-y-3'
					>
						{/* Заголовок помещения */}
						<div className='flex items-center justify-between px-1'>
							<div className='flex gap-2 items-center'>
								<h2
									className={`font-semibold text-sm uppercase tracking-wide ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}
								>
									{place.name}
								</h2>
								<button
									onClick={() => showModalPlace(place, 'EDIT')}
									className={`p-1.5 rounded-lg cursor-pointer transition-colors ${isDark ? 'hover:bg-neutral-800 text-neutral-500' : 'hover:bg-slate-200 text-slate-400'}`}
									title='Редактировать'
								>
									<Pencil className='w-4 h-4' />
								</button>
							</div>
							<div className='flex items-center gap-1'>
								<button
									onClick={() => toggleCollapse(place.id)}
									className={`p-1.5 rounded-lg cursor-pointer transition-colors ${isDark ? 'hover:bg-neutral-800 text-neutral-500' : 'hover:bg-slate-200 text-slate-400'}`}
									title={isCollapsed ? 'Развернуть' : 'Свернуть'}
								>
									{isCollapsed ? (
										<EyeClosed className='w-4 h-4' />
									) : (
										<Eye className='w-4 h-4' />
									)}
								</button>

								<button
									onClick={() => showModalPlace(place, 'DELETE')}
									className={`p-1.5 rounded-lg cursor-pointer transition-colors ${isDark ? 'hover:bg-neutral-800 text-neutral-500' : 'hover:bg-slate-200 text-slate-400'}`}
								>
									<Trash2 className='w-4 h-4' />
								</button>
							</div>
						</div>

						{/* Список работ + DnD */}
						{!isCollapsed && (
							<div className='flex flex-col gap-5'>
								{place.works.length === 0 ? (
									<p
										className={`text-sm text-center py-4 ${isDark ? 'text-neutral-600' : 'text-slate-400'}`}
									>
										Нет работ
									</p>
								) : (
									<DndContext
										sensors={sensors}
										collisionDetection={closestCenter}
										onDragStart={handleDragStart}
										onDragEnd={e => handleDragEnd(e, place.id)}
									>
										<SortableContext
											items={place.works.map(w => w.id)}
											strategy={verticalListSortingStrategy}
											disabled={!isReorder}
										>
											{place.works.map(work => (
												<WorkItem
													id={
														work.id === place.works[0].id
															? 'firstWorkItem'
															: work.id === place.works[1].id
																? 'secondWorkItem'
																: undefined
													}
													key={work.id}
													place={place}
													work={work}
												/>
											))}
										</SortableContext>

										<DragOverlay dropAnimation={null}>
											{activeWork ? (
												<div className='scale-105 shadow-2xl opacity-95'>
													<WorkItem
														place={activeWork.place}
														work={activeWork.work}
														isOverlay // ← специальный проп
													/>
												</div>
											) : null}
										</DragOverlay>
									</DndContext>
								)}
							</div>
						)}

						{/* Кнопка добавления работы */}
						<button
							id='addWorkButton'
							onClick={() => onAddWorkClick(place.id)}
							className={`${isCollapsed ? 'hidden' : ''} w-full py-3 rounded-xl border border-dashed text-sm cursor-pointer transition-colors ${
								isDark
									? 'border-neutral-700 text-neutral-400 hover:bg-neutral-900'
									: 'border-slate-300 text-slate-500 hover:bg-slate-50'
							}`}
						>
							+ Добавить работу
						</button>
					</div>
				)
			})}

			{/* Модалки */}
			<Modal
				isOpen={isDeleteModal}
				onClose={() => setIsDeleteModal(false)}
				description={`Название помещения: ${editingPlace?.name}`}
				title='Уверены, что хотите удалить помещение?'
				buttons={{
					grey: { title: 'Нет', onClick: () => setIsDeleteModal(false) },
					blue: {
						title: 'Удалить',
						onClick: () => {
							setIsDeleteModal(false)
							if (!editingPlace) return
							onRemovePlace(editingPlace.id)
						}
					}
				}}
			/>
			<PlaceModal
				open={isPlaceEditModal}
				value={editingPlace?.name}
				placeId={editingPlace?.id}
				onClose={() => setIsPlaceEditModal(false)}
			/>
		</>
	)
}

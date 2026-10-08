import { defaultAnimateLayoutChanges, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Menu, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Modal from '../../../components/Modal'
import { useSmetaStore } from '../../../store/smetaStore'
import { type Place, type Work } from '../../../types'
import { useLongPress } from '../../../utils/hooks/useLongPress'

interface Props {
	place: Place
	work: Work
	isOverlay?: boolean // ← новый проп
}

const UNIT_COLORS: Record<string, string> = {
	м2: '#613435',
	'м²': '#613435',
	м3: '#613435',
	'м³': '#613435',
	комплекс: '#4B6134',
	'м.п.': '#423461',
	'м/п': '#423461',
	'м.п': '#423461',
	шт: '#615A34'
}

function getUnitColor(unit: string) {
	const key = unit.toLowerCase().trim()
	return UNIT_COLORS[key] || '#4B5563'
}

export default function WorkItem({ place, work, isOverlay = false }: Props) {
	const { removeWork, viewType, isReorder, setIsReorder } = useSmetaStore()
	const [isDeleteModal, setIsDeleteModal] = useState(false)
	const longPressedRef = useRef(false)

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging
	} = useSortable({
		id: work.id,
		disabled: !isReorder || isOverlay,
		animateLayoutChanges: args =>
			defaultAnimateLayoutChanges({ ...args, wasDragging: true })
	})

	const style: React.CSSProperties = {
		transform: isOverlay ? undefined : CSS.Transform.toString(transform),
		transition: isOverlay ? undefined : transition,
		opacity: isDragging && !isOverlay ? 0.3 : 1,
		zIndex: isDragging ? 50 : undefined
	}

	const sum = viewType === 'TOTAL' ? work.quantity * work.price : work.price

	const handleLongPress = () => {
		longPressedRef.current = true
		setIsReorder(true)
	}

	const longPressEvents = useLongPress(handleLongPress, 800)

	const handleLinkClick = (e: React.MouseEvent) => {
		// если был long press — отменяем переход
		if (longPressedRef.current || isReorder) {
			e.preventDefault()
			e.stopPropagation()
			longPressedRef.current = false // сбрасываем на следующий раз
			return
		}
	}
	return (
		<div
			ref={isOverlay ? undefined : setNodeRef}
			style={style}
			className={isOverlay ? 'cursor-grabbing' : ''}
		>
			<div
				className={`
        rounded-2xl p-4 text-white relative shadow-lg select-none
        ${isReorder && !isOverlay && !isDragging ? 'animate-wiggle' : ''}
        ${isOverlay ? 'shadow-2xl scale-105' : ''}
      `}
				style={{ backgroundColor: getUnitColor(work.unit) }}
			>
				<p className='font-medium text-[15px] leading-snug mb-3 text-center px-8'>
					{work.name}
				</p>

				<div className='flex gap-2'>
					<span className='flex-1 text-center px-2.5 py-1 rounded-lg text-xs font-medium bg-black/25'>
						x{work.quantity}
					</span>
					<span className='flex-1 text-center px-2.5 py-1 rounded-lg text-xs font-medium bg-black/25'>
						{work.unit}
					</span>
					<span className='flex-3 text-center px-2.5 py-1 rounded-lg text-xs font-medium bg-black/25'>
						{sum.toLocaleString('ru-RU')} ₽
					</span>
				</div>

				{!isOverlay && (
					<>
						<button
							{...(isReorder ? { ...attributes, ...listeners } : {})}
							onClick={
								isReorder
									? undefined
									: e => {
											e.preventDefault()
											e.stopPropagation()
											setIsDeleteModal(true)
										}
							}
							className='absolute top-3 right-3 p-2 rounded-xl bg-black/20 hover:bg-black/40 transition-colors cursor-pointer z-10 touch-none'
						>
							{isReorder ? (
								<Menu className='w-4 h-4' />
							) : (
								<Trash2 className='w-4 h-4' />
							)}
						</button>

						{!isReorder && (
							<Link
								{...longPressEvents}
								to={`/works/${place.id}/${work.id}`}
								onClick={handleLinkClick}
								className='absolute inset-0 rounded-2xl z-0'
							/>
						)}
					</>
				)}

				<Modal
					isOpen={isDeleteModal}
					onClose={() => setIsDeleteModal(false)}
					description={`Название работы: ${work.name}`}
					title='Уверены, что хотите удалить работу?'
					buttons={{
						grey: { title: 'Нет', onClick: () => setIsDeleteModal(false) },
						blue: {
							title: 'Удалить',
							onClick: () => {
								setIsDeleteModal(false)
								removeWork(place.id, work.id)
							}
						}
					}}
				/>
			</div>
		</div>
	)
}

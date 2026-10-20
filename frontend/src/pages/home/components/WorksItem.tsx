import { defaultAnimateLayoutChanges, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Menu, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Modal from '../../../components/Modal'
import { useSmetaStore } from '../../../store/smetaStore'
import { type Place, type Work } from '../../../types'
import { useLongPress } from '../../../utils/hooks/useLongPress'
import { getUnitColor } from '../../../utils/unitColors'

interface Props {
	place: Place
	work: Work
	id?: string
	isOverlay?: boolean // ← новый проп
}

export default function WorkItem({
	place,
	work,
	isOverlay = false,
	id
}: Props) {
	const { removeWork, viewType, isReorder, setIsReorder, isSolidView, isDark } =
		useSmetaStore()
	const [isDeleteModal, setIsDeleteModal] = useState(false)
	const longPressedRef = useRef(false)

	const {
		attributes,
		listeners,
		setNodeRef,
		setActivatorNodeRef,
		transform,
		transition,
		isDragging
	} = useSortable({
		id: work.id,
		disabled: !isReorder || isOverlay,
		animateLayoutChanges: args =>
			defaultAnimateLayoutChanges({
				...args,
				wasDragging: true
			})
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

	const workIndex = place.works.indexOf(work) + 1
	return (
		<div
			id={id}
			ref={isOverlay ? undefined : setNodeRef}
			style={style}
			className={`${isOverlay ? 'cursor-grabbing' : ''} touch-pan-y select-none
		[-webkit-touch-callout:none]`}
		>
			<div
				className={`
		rounded-2xl p-4 text-white  relative shadow-lg select-none
		${isReorder && !isOverlay && !isDragging ? 'animate-wiggle' : ''}
		${isOverlay ? 'shadow-2xl scale-105' : ''}
	`}
				style={{ backgroundColor: getUnitColor(work.unit, { isDark: isDark }) }}
			>
				<p
					className={`${isSolidView ? 'hidden' : ''} absolute top-3.5 left-3 
	 z-10 ${isReorder ? 'touch-none' : ''}`}
				>
					{workIndex}.
				</p>
				<p
					className={`font-medium text-[15px] wrap-break-word leading-snug  ${isSolidView ? 'pr-8' : 'text-center mb-3 px-8'} `}
				>
					{isSolidView ? `${workIndex}. ${work.name}` : work.name}
				</p>

				<div className={`gap-2 ${isSolidView ? 'hidden' : 'flex'}`}>
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
							ref={setActivatorNodeRef}
							id={isReorder ? 'reorderIcon' : undefined}
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
							className={`absolute top-3 right-3 p-2 rounded-xl
		bg-black/20 hover:bg-black/40 transition-colors
		cursor-pointer z-10 ${isReorder ? 'touch-none' : ''}`}
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
								draggable={false}
								className='absolute inset-0 rounded-2xl z-0 select-none [-webkit-touch-callout:none]'
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

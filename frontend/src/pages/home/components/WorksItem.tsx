import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Modal from '../../../components/Modal'
import { useSmetaStore } from '../../../store/smetaStore'
import { type Place, type Work } from '../../../types'

interface Props {
	place: Place
	work: Work
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

export default function WorkItem({ place, work }: Props) {
	const { removeWork, viewType } = useSmetaStore()
	const [isDeleteModal, setIsDeleteModal] = useState(false)

	const color = getUnitColor(work.unit)
	const sum = viewType === 'TOTAL' ? work.quantity * work.price : work.price

	return (
		<div
			key={work.id}
			className='rounded-2xl p-4 text-white relative shadow-lg'
			style={{ backgroundColor: color }}
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

			<button
				onClick={e => {
					e.preventDefault()
					e.stopPropagation()
					setIsDeleteModal(true)
				}}
				className='absolute top-3 right-3 p-2 rounded-xl bg-black/20 hover:bg-black/40 transition-colors cursor-pointer z-10'
			>
				<Trash2 className='w-4 h-4' />
			</button>

			<Link
				to={`/works/${place.id}/${work.id}`}
				className='absolute inset-0 rounded-2xl z-0'
			/>
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
	)
}

import { Download, Plus, Settings, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { createSearchParams, Link, useNavigate } from 'react-router-dom'
import slugify from 'slugify'
import { generateSmeta } from '../api/smetaApi'
import AddPlaceModal from '../components/AddPlaceModal'
import Modal from '../components/Modal'
import WorkItem from '../components/ui/WorksItem'
import { useSmetaStore } from '../store/smetaStore'
import type { ModalMessageType } from '../types'

export default function HomePage() {
	const {
		places,
		objectName,
		transportCost,
		trashCost,
		isDark,
		removePlace,
		setViewType,
		viewType,
		clearAll,
		isTransportCost,
		isTrashCost
	} = useSmetaStore()

	const navigate = useNavigate()
	const [saving, setSaving] = useState(false)
	const [showAddPlace, setShowAddPlace] = useState(false)

	const [isErrorModal, setIsErrorModal] = useState(false)
	const [modalMessage, setModalMessage] = useState<ModalMessageType>({
		title: 'Ошибка',
		description: ''
	})

	const allWorksCount = places.reduce((sum, p) => sum + p.works.length, 0)

	const total =
		places.reduce((sum, place) => {
			return sum + place.works.reduce((s, w) => s + w.quantity * w.price, 0)
		}, 0) +
		(isTransportCost ? transportCost : 0) +
		(isTrashCost ? trashCost : 0)

	const handleSave = async () => {
		if (!objectName.trim()) {
			setModalMessage({
				...modalMessage,
				description: 'Укажите название объекта в настройках'
			})
			setIsErrorModal(true)
			return
		}

		if (allWorksCount === 0) {
			setModalMessage({
				...modalMessage,
				description: 'Добавьте хотя бы одну работу'
			})
			setIsErrorModal(true)
			return
		}

		try {
			setSaving(true)

			// Собираем данные в формат, который ждёт бэкенд
			const placesPayload: Record<string, any[]> = {}
			places.forEach(place => {
				if (place.works.length > 0) {
					placesPayload[place.name] = place.works.map(w => ({
						name: w.name,
						unit: w.unit,
						quantity: w.quantity,
						price: w.price
					}))
				}
			})

			const blob = await generateSmeta({
				object: objectName,
				places: placesPayload,
				transportCost:
					isTransportCost && transportCost != 0 ? transportCost : undefined,
				trashCost: isTrashCost && trashCost != 0 ? trashCost : undefined
			})

			// Скачивание файла
			const url = URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = url

			const safeName = slugify(objectName, {
				lower: true,
				replacement: '_',
				locale: 'ru'
			}).substring(0, 40)
			a.download = `smeta_${safeName || 'document'}.xlsx`
			a.click()
			URL.revokeObjectURL(url)
		} catch (err: any) {
			setModalMessage({
				...modalMessage,
				description: err.message || 'Ошибка при создании сметы'
			})
			setIsErrorModal(true)
		} finally {
			setSaving(false)
		}
	}

	return (
		<div className='pb-40'>
			{/* Список помещений и работ */}
			<div className='flex flex-col items-center gap-6'>
				{places.length === 0 ? (
					<div
						className={`text-center py-20 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}
					>
						<p className='text-lg'>Помещений пока нет</p>
						<p className='text-sm mt-2'>Добавьте первое помещение</p>
					</div>
				) : (
					places.map(place => (
						<div
							key={place.id}
							className='w-full max-w-md space-y-3'
						>
							{/* Заголовок помещения */}
							<div className='flex items-center justify-between px-1'>
								<h2
									className={`font-semibold text-sm uppercase tracking-wide ${
										isDark ? 'text-neutral-400' : 'text-slate-500'
									}`}
								>
									{place.name}
								</h2>
								<button
									onClick={() => {
										if (confirm(`Удалить помещение «${place.name}»?`)) {
											removePlace(place.id)
										}
									}}
									className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
										isDark
											? 'hover:bg-neutral-800 text-neutral-500'
											: 'hover:bg-slate-200 text-slate-400'
									}`}
								>
									<Trash2 className='w-4 h-4' />
								</button>
							</div>

							{/* Работы помещения */}
							{place.works.length === 0 ? (
								<p
									className={`text-sm text-center py-4 ${isDark ? 'text-neutral-600' : 'text-slate-400'}`}
								>
									Нет работ
								</p>
							) : (
								place.works.map(work => {
									return (
										<WorkItem
											place={place}
											work={work}
										/>
									)
								})
							)}

							{/* Кнопка добавить работу в это помещение */}
							<button
								onClick={() => navigate(`/works/new?placeId=${place.id}`)}
								className={`w-full py-3 rounded-xl border border-dashed text-sm cursor-pointer transition-colors ${
									isDark
										? 'border-neutral-700 text-neutral-400 hover:bg-neutral-900'
										: 'border-slate-300 text-slate-500 hover:bg-slate-50'
								}`}
							>
								+ Добавить работу
							</button>
						</div>
					))
				)}

				{/* Кнопка добавить помещение */}
				<button
					onClick={() => setShowAddPlace(true)}
					className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors cursor-pointer ${
						isDark
							? 'bg-neutral-800 border border-neutral-700 hover:bg-neutral-700'
							: 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-800'
					}`}
					title='Добавить помещение'
				>
					<Plus className='w-7 h-7' />
				</button>
			</div>

			{/* Нижняя панель */}
			<div
				className={`fixed bottom-0 left-0 right-0 z-20 ${isDark ? 'bg-neutral-950' : 'bg-white'}`}
			>
				<div className='max-w-2xl mx-auto px-4 py-4'>
					<div className='flex justify-center mb-4'>
						<button
							onClick={() => {
								if (viewType === 'QUANTITY') {
									setViewType('TOTAL')
								} else {
									setViewType('QUANTITY')
								}
							}}
							className={`cursor-pointer px-4 py-1.5 rounded-full text-sm ${
								isDark
									? 'bg-neutral-800 text-neutral-300'
									: 'bg-slate-100 text-slate-600'
							}`}
						>
							Итого:{' '}
							<span
								className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}
							>
								{total.toLocaleString('ru-RU')} ₽
							</span>
						</button>
					</div>

					<div className='flex items-center gap-3'>
						<button
							onClick={() => {
								if (allWorksCount > 0 && confirm('Удалить все данные?'))
									clearAll()
							}}
							className='h-12 px-4 rounded-2xl bg-red-500/90 hover:bg-red-500 flex items-center justify-center transition-colors cursor-pointer shrink-0'
						>
							<Trash2 className='w-5 h-5 text-white' />
						</button>

						<button
							onClick={handleSave}
							disabled={saving || allWorksCount === 0}
							className={`flex-1 h-12 rounded-2xl font-semibold text-base transition-colors cursor-pointer flex items-center justify-center gap-2 ${
								isDark
									? 'bg-white text-black hover:bg-neutral-100'
									: 'bg-blue-600 text-white hover:bg-blue-700'
							} disabled:opacity-40 disabled:cursor-not-allowed`}
						>
							{saving ? (
								'Создание...'
							) : (
								<>
									<Download className='w-5 h-5' />
									Скачать смету
								</>
							)}
						</button>

						<Link
							to='/settings'
							className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
								isDark
									? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
									: 'bg-slate-100 hover:bg-slate-200 text-slate-600'
							}`}
						>
							<Settings className='w-5 h-5' />
						</Link>
					</div>
				</div>
			</div>
			<AddPlaceModal
				open={showAddPlace}
				onClose={() => setShowAddPlace(false)}
			/>
			<Modal
				buttons={{
					blue: {
						title: 'Ок',
						onClick: () => {
							setIsErrorModal(false)
							navigate({
								pathname: '/settings',
								search: `?${createSearchParams({ focus: 'true' })}`
							})
						}
					}
				}}
				description={modalMessage.description}
				isOpen={isErrorModal}
				onClose={() => {
					setIsErrorModal(false)
					navigate({
						pathname: '/settings',
						search: `?${createSearchParams({ focus: 'true' })}`
					})
				}}
				title={modalMessage.title}
			/>
		</div>
	)
}

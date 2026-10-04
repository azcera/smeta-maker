// pages/HomePage.tsx
import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createSearchParams, useNavigate } from 'react-router-dom'
import AddPlaceModal from '../../components/PlaceModal'
import Modal from '../../components/Modal'
import { useSmetaStore } from '../../store/smetaStore'
import type { ModalMessageType } from '../../types'
import { BottomActionBar } from './components/BottomActionBar'
import { PlaceList } from './components/PlaceList'
import { useSmetaExport } from './hooks/useSmetaExport'

export default function HomePage() {
	const navigate = useNavigate()
	const {
		places,
		objectName,
		transportCost,
		trashCost,
		isDark,
		removePlace,
		clearAll,
		isTransportCost,
		isTrashCost,
		isMultiplePlaces
	} = useSmetaStore()

	const [showAddPlace, setShowAddPlace] = useState(false)
	const [isErrorModal, setIsErrorModal] = useState(false)
	const [isDeleteModal, setIsDeleteModal] = useState(false)
	const [modalMessage, setModalMessage] = useState<ModalMessageType>({
		title: 'Ошибка',
		description: ''
	})

	const handleError = (msg: ModalMessageType) => {
		setModalMessage(msg)
		setIsErrorModal(true)
	}

	const { handleSave, saving } = useSmetaExport(handleError)
	useEffect(() => {
		document.title = 'Создатель смет'
	}, [])

	useEffect(() => {
		if (places.length > 0) {
			const timer = setTimeout(() => {
				window.scrollTo({
					top: document.documentElement.scrollHeight,
					behavior: 'smooth'
				})
			}, 50)

			return () => clearTimeout(timer)
		}
	}, [places])

	const allWorksCount = places.reduce((sum, p) => sum + p.works.length, 0)
	const total =
		places.reduce((sum, place) => {
			return sum + place.works.reduce((s, w) => s + w.quantity * w.price, 0)
		}, 0) +
		(isTransportCost ? transportCost : 0) +
		(isTrashCost ? trashCost : 0)

	const navigateToSettings = () => {
		setIsErrorModal(false)
		navigate({
			pathname: '/settings',
			search: `?${createSearchParams({ focus: 'true' })}`
		})
	}

	return (
		<div className='pb-40'>
			<div className='flex flex-col items-center gap-6'>
				<PlaceList
					places={places}
					isDark={isDark}
					onRemovePlace={removePlace}
					onAddWorkClick={id => navigate(`/works/new?placeId=${id}`)}
				/>
				{places.length > 0 && !isMultiplePlaces ? null : (
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
				)}
			</div>

			<BottomActionBar
				total={total}
				allWorksCount={allWorksCount}
				saving={saving}
				onSaveClick={handleSave}
				onDeleteClick={() => {
					if (allWorksCount > 0 || objectName.length > 0) setIsDeleteModal(true)
				}}
			/>

			<AddPlaceModal
				open={showAddPlace}
				onClose={() => setShowAddPlace(false)}
			/>

			<Modal
				title={modalMessage.title}
				description={modalMessage.description}
				isOpen={isErrorModal}
				onClose={navigateToSettings}
				buttons={{ blue: { title: 'Ок', onClick: navigateToSettings } }}
			/>

			<Modal
				isOpen={isDeleteModal}
				onClose={() => setIsDeleteModal(false)}
				description='Выберите действие'
				title='Уверены, что хотите очистить данные?'
				buttons={{
					grey: { title: 'Нет', onClick: () => setIsDeleteModal(false) },
					blue: {
						title: 'Удалить',
						onClick: () => {
							clearAll()
							setIsDeleteModal(false)
						}
					}
				}}
			/>
		</div>
	)
}

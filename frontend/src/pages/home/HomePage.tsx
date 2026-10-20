// pages/HomePage.tsx
import { Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
	createSearchParams,
	useNavigate,
	useSearchParams
} from 'react-router-dom'
import Modal from '../../components/Modal'
import PlaceModal from '../../components/PlaceModal'
import { useSmetaStore } from '../../store/smetaStore'
import type { ModalMessageType } from '../../types'
import { BottomActionBar } from './components/BottomActionBar'
import { PlaceList } from './components/PlaceList'
import { useSmartScrollToBottom } from './hooks/useSmartScrollToBottom'
import { useSmetaExport } from './hooks/useSmetaExport'

export default function HomePage() {
	const navigate = useNavigate()
	const {
		places,
		transportCost,
		trashCost,
		isDark,
		removePlace,
		isTransportCost,
		isTrashCost,
		setIsReorder,
		isTourCompleted,
		setIsTourCompleted,
		setShowTour,
		showTour,
		tourStep
	} = useSmetaStore()

	const [showAddPlace, setShowAddPlace] = useState(false)
	const [isErrorModal, setIsErrorModal] = useState(false)
	const [isTourModal, setIsTourModal] = useState(false)
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
		if (!isTourCompleted && !showTour && tourStep === null) {
			setIsTourModal(true)
		}
	}, [])

	const scrollContainerRef = useRef<HTMLDivElement>(null)

	const [searchParams, _] = useSearchParams()

	useSmartScrollToBottom({
		containerRef: scrollContainerRef,
		itemsCount: places.reduce((s, p) => s + p.works.length, 0) + places.length,
		enabled: searchParams.get('scroll') === 'true'
	})

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

	const [canReorder, setCanReorder] = useState(true)

	useEffect(() => {
		const container = scrollContainerRef.current
		if (!container) return

		const handleScroll = () => setCanReorder(false)

		const handleScrollEnd = () => setCanReorder(true)

		container.addEventListener('scroll', handleScroll, { passive: true })
		container.addEventListener('scrollend', handleScrollEnd)

		return () => {
			container.removeEventListener('scroll', handleScroll)
			container.removeEventListener('scrollend', handleScrollEnd)
		}
	}, [])

	return (
		<div
			id='homePage'
			onClick={() => setIsReorder(false)}
			className={`max-w-md mx-auto flex flex-col h-full overflow-hidden relative w-full ${
				isDark ? 'bg-neutral-950' : 'bg-slate-100'
			}`}
		>
			<div
				ref={scrollContainerRef}
				className='app-scroll no-scrollbar flex flex-col min-h-0 items-center w-full flex-1 space-y-5 px-4'
				style={{
					paddingBottom: 'calc(120px + env(safe-area-inset-bottom, 0px))'
				}}
			>
				<PlaceList
					canReorder={canReorder}
					places={places}
					isDark={isDark}
					onRemovePlace={removePlace}
					onAddWorkClick={id => navigate(`/works/new?placeId=${id}`)}
				/>
				<button
					id='addPlaceButton'
					onClick={() => setShowAddPlace(true)}
					className={`shrink-0 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors cursor-pointer ${
						isDark
							? 'bg-neutral-800 border border-neutral-700 hover:bg-neutral-700'
							: 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-800'
					}`}
					title='Добавить помещение'
				>
					<Plus className='w-7 h-7' />
				</button>
			</div>

			<BottomActionBar
				total={total}
				allWorksCount={allWorksCount}
				saving={saving}
				onSaveClick={handleSave}
			/>

			<PlaceModal
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
				isOpen={isTourModal}
				onClose={() => {
					setIsTourCompleted(true)
					setIsTourModal(false)
				}}
				description='Будет проведен тур по основному функционалу для наглядного отображения возможностей программы.'
				title='Начать прохождение обучения?'
				buttons={{
					grey: {
						title: 'Нет',
						onClick: () => {
							setIsTourCompleted(true)
							setIsTourModal(false)
						}
					},
					blue: {
						title: 'Начать',
						onClick: () => {
							setIsTourModal(false)
							setShowTour(true)
						}
					}
				}}
			/>
		</div>
	)
}

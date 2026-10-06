import { useEffect, useRef, useState, type SubmitEvent } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Modal from '../../components/Modal'
import { useSmetaStore } from '../../store/smetaStore'
import type { ModalMessageType, NormalizedWork } from '../../types'
import { useLockScroll } from '../../utils/hooks/useLockScroll'
import { WorkFormStep } from './components/WorkFormStep'
import { WorkSearchStep } from './components/WorkSearchStep'

export default function EditWorkPage() {
	const { placeId: paramPlaceId, id } = useParams()
	const [searchParams] = useSearchParams()
	const navigate = useNavigate()

	const { places, addWork, updateWork, isDark, dbWorks, dbWorksLoaded } =
		useSmetaStore()

	const quantityRef = useRef<HTMLInputElement>(null)
	const nameInputRef = useRef<HTMLInputElement>(null)

	const placeIdFromQuery = searchParams.get('placeId')
	const placeId = paramPlaceId || placeIdFromQuery || ''
	const isNew = !id || id === 'new'

	const currentPlace = places.find(p => p.id === placeId)
	const existing =
		!isNew && currentPlace ? currentPlace.works.find(w => w.id === id) : null

	// Состояние формы и шагов
	const [step, setStep] = useState<'search' | 'form'>(isNew ? 'search' : 'form')
	const [query, setQuery] = useState('')
	const [name, setName] = useState('')
	const [unit, setUnit] = useState('комплекс')
	const [quantity, setQuantity] = useState(0)
	const [tempQuantity, setTempQuantity] = useState(0)
	const [price, setPrice] = useState(0)
	const [fromDb, setFromDb] = useState(false)

	const [units, setUnits] = useState<string[]>([
		'м²',
		'м³',
		'м.п.',
		'шт',
		'комплекс'
	])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	const [isErrorModal, setIsErrorModal] = useState(false)
	const [modalMessage, setModalMessage] = useState<ModalMessageType>({
		title: 'Ошибка',
		description: ''
	})

	// Эффекты инициализации и фокусов
	useEffect(() => {
		document.title = isNew
			? 'Создатель смет | Новая работа'
			: 'Создатель смет | Редактирование работы'
	}, [isNew])

	useEffect(() => {
		if (step !== 'search') return
		const load = async () => {
			try {
				setLoading(true)
				setError('')
				let uniqueUnits = Array.from(
					new Set(dbWorks.map(w => w.unit).filter(Boolean))
				).sort()
				uniqueUnits.push('комплекс')
				if (uniqueUnits.length > 0) setUnits(uniqueUnits)
			} catch (err) {
				setError('Не удалось загрузить базу работ')
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [step, dbWorks])

	useEffect(() => {
		if (existing) {
			setName(existing.name)
			setUnit(existing.unit)
			setQuantity(existing.quantity)
			setPrice(existing.price)
			setFromDb(!!existing.fromDb)
			setStep('form')
		}
	}, [existing])

	useEffect(() => {
		if (step !== 'search' || !dbWorksLoaded) return
		const timer = setTimeout(() => nameInputRef.current?.focus(), 150)
		return () => clearTimeout(timer)
	}, [step, dbWorksLoaded])

	useEffect(() => {
		if (step === 'form') {
			setTimeout(() => {
				quantityRef.current?.focus()
				quantityRef.current?.select()
			}, 50)
		}
	}, [step])

	const filtered = dbWorks.filter(w => {
		const searchWords = query.toLowerCase().split(/\s+/).filter(Boolean)

		const nameLower = w.name.toLowerCase()

		return searchWords.every(word => nameLower.includes(word))
	})

	const selectFromDb = (item: NormalizedWork) => {
		setName(item.name)
		setUnit(item.unit)
		setPrice(item.price)
		setQuantity(0)
		setFromDb(true)
		setStep('form')
	}

	const goToManual = () => {
		setName(query)
		setQuantity(1)
		setFromDb(false)
		setStep('form')
	}

	useEffect(() => {
		document.body.style.overflow = 'hidden'

		return () => {
			document.body.style.overflow = ''
		}
	}, [step])

	useLockScroll(true)

	// ИСПРАВЛЕНО: Раньше стоял тип React.ChangeEvent, что приводило к ошибкам типов на форме
	const handleSubmit = (e: SubmitEvent) => {
		e.preventDefault()
		if (!name.trim()) {
			setModalMessage({ title: 'Ошибка', description: 'Введите название' })
			setIsErrorModal(true)
			return
		}

		const workData = { name, unit, quantity, price, fromDb }

		if (isNew) {
			addWork(placeId, workData)
		} else if (id) {
			updateWork(placeId, id, workData)
		}
		navigate('/')
	}

	// Отрендерить нужный шаг
	return (
		<>
			{step === 'search' ? (
				<WorkSearchStep
					query={query}
					setQuery={setQuery}
					filteredWorks={filtered}
					loading={loading}
					error={error}
					isDark={isDark}
					currentPlaceName={currentPlace?.name}
					onBack={() => navigate('/')}
					onSelectWork={selectFromDb}
					onGoToManual={goToManual}
					nameInputRef={nameInputRef}
				/>
			) : (
				<WorkFormStep
					isNew={isNew}
					isDark={isDark}
					currentPlaceName={currentPlace?.name}
					name={name}
					setName={setName}
					unit={unit}
					setUnit={setUnit}
					units={units}
					quantity={quantity}
					setQuantity={setQuantity}
					price={price}
					setPrice={setPrice}
					tempQuantity={tempQuantity}
					setTempQuantity={setTempQuantity}
					quantityRef={quantityRef}
					onBack={() => (isNew ? setStep('search') : navigate('/'))}
					onSubmit={handleSubmit}
				/>
			)}

			<Modal
				buttons={{
					blue: { title: 'Ок', onClick: () => setIsErrorModal(false) }
				}}
				description={modalMessage.description}
				isOpen={isErrorModal}
				onClose={() => setIsErrorModal(false)}
				title={modalMessage.title}
			/>
		</>
	)
}

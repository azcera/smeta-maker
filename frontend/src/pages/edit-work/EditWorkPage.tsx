import { ArrowLeft, Save, Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Modal from '../../components/Modal'
import { useSmetaStore } from '../../store/smetaStore'
import type { ModalMessageType, NormalizedWork } from '../../types'

export default function EditWorkPage() {
	const { placeId: paramPlaceId, id } = useParams()
	const [searchParams] = useSearchParams()
	const navigate = useNavigate()
	const { places, addWork, updateWork, isDark, dbWorks, dbWorksLoaded } =
		useSmetaStore()
	const quantityRef = useRef<HTMLInputElement>(null)

	const placeIdFromQuery = searchParams.get('placeId')
	const placeId = paramPlaceId || placeIdFromQuery || ''

	const isNew = !id || id === 'new'
	const currentPlace = places.find(p => p.id === placeId)
	const existing =
		!isNew && currentPlace ? currentPlace.works.find(w => w.id === id) : null

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
	}, [step])

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

	const nameInputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		// focus code
		let title = 'Создатель смет'
		if (existing) {
			title += ' | Редактирование работы'
		} else {
			title += ' | Новая работа'
		}
		document.title = title
	}, [])

	useEffect(() => {
		if (step !== 'search' || !dbWorksLoaded) return

		const timer = setTimeout(() => {
			nameInputRef.current?.focus()
		}, 150)

		return () => clearTimeout(timer)
	}, [step, dbWorksLoaded])

	useEffect(() => {
		if (step === 'form') {
			// Небольшая задержка, чтобы поле успело отрендериться
			setTimeout(() => {
				quantityRef.current?.focus()
				quantityRef.current?.select()
			}, 50)
		}
	}, [step])

	const filtered = dbWorks.filter(w =>
		w.name.toLowerCase().includes(query.toLowerCase())
	)

	const selectFromDb = (item: NormalizedWork) => {
		setName(item.name)
		setUnit(item.unit)
		setPrice(item.price)
		setFromDb(true)
		setStep('form')
	}

	const goToManual = () => {
		setName(query)
		setFromDb(false)
		setStep('form')
	}

	const handleSubmit = (e: React.ChangeEvent) => {
		e.preventDefault()
		if (!name.trim()) {
			setModalMessage({
				...modalMessage,
				description: 'Введите название'
			})
			setIsErrorModal(true)
			return
		}

		if (isNew) {
			addWork(placeId, { name, unit, quantity, price, fromDb })
		} else if (id) {
			updateWork(placeId, id, { name, unit, quantity, price, fromDb })
		}
		navigate('/')
	}

	const inputClass = `w-full px-4 py-3 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
		isDark
			? 'bg-neutral-900 border border-neutral-700 text-white placeholder:text-neutral-500'
			: 'bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400'
	}`

	const cardClass = `rounded-2xl p-5 ${
		isDark ? 'bg-neutral-900' : 'bg-white border border-slate-200 shadow-sm'
	}`

	// ===== Поиск =====
	if (step === 'search') {
		return (
			<div className='max-w-md mx-auto flex flex-col h-[calc(100vh-3rem)]'>
				<div className='sticky top-0 z-10 pb-4 space-y-4'>
					<div className='flex items-center gap-3'>
						<button
							onClick={() => navigate('/')}
							className={`p-2 -ml-2 rounded-xl cursor-pointer ${
								isDark ? 'hover:bg-neutral-800' : 'hover:bg-slate-200'
							}`}
						>
							<ArrowLeft className='w-5 h-5' />
						</button>
						<div>
							<h1 className='text-xl font-bold'>Новая работа</h1>
							{currentPlace && (
								<p
									className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}
								>
									{currentPlace.name}
								</p>
							)}
						</div>
					</div>

					<div className='relative'>
						<Search
							className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
								isDark ? 'text-neutral-500' : 'text-slate-400'
							}`}
						/>
						<input
							value={query}
							onChange={e => setQuery(e.target.value)}
							placeholder='Начните вводить название...'
							className={`${inputClass} pl-11`}
							ref={nameInputRef}
						/>
					</div>

					{loading && (
						<p className='text-sm text-center text-neutral-400'>
							Загрузка базы...
						</p>
					)}
					{error && <p className='text-sm text-center text-red-400'>{error}</p>}
				</div>

				<div className='flex-1 overflow-y-auto space-y-2 pb-6'>
					{query.length > 1 &&
						!loading &&
						filtered.length > 0 &&
						filtered.slice(0, 50).map(item => (
							<button
								key={item.id}
								onClick={() => selectFromDb(item)}
								className={`w-full text-left px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
									isDark
										? 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800'
										: 'bg-white border-slate-200 hover:bg-slate-50'
								}`}
							>
								<p className='text-sm font-medium'>{item.name}</p>
								<p
									className={`text-xs mt-1 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}
								>
									{item.unit} · {item.price.toLocaleString('ru-RU')} ₽
									{item.category && ` · ${item.category}`}
								</p>
							</button>
						))}

					{query.length > 1 && !loading && filtered.length === 0 && (
						<div className='text-center py-8'>
							<p
								className={`text-sm mb-4 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}
							>
								Ничего не найдено
							</p>
							<button
								onClick={goToManual}
								className='px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium cursor-pointer'
							>
								Создать вручную
							</button>
						</div>
					)}
				</div>
			</div>
		)
	}

	// ===== Форма =====
	return (
		<div className='space-y-5 max-w-md mx-auto'>
			<div className='flex items-center gap-3'>
				<button
					onClick={() => (isNew ? setStep('search') : navigate('/'))}
					className={`p-2 -ml-2 rounded-xl cursor-pointer ${
						isDark ? 'hover:bg-neutral-800' : 'hover:bg-slate-200'
					}`}
				>
					<ArrowLeft className='w-5 h-5' />
				</button>
				<div>
					<h1 className='text-xl font-bold'>
						{isNew ? 'Новая работа' : 'Редактирование'}
					</h1>
					{currentPlace && (
						<p
							className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}
						>
							{currentPlace.name}
						</p>
					)}
				</div>
			</div>

			<form
				onSubmit={handleSubmit}
				className={`${cardClass} space-y-4`}
			>
				<div>
					<label
						className={`block text-sm mb-1.5 ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}
					>
						Наименование
					</label>
					<input
						value={name}
						onChange={e => setName(e.target.value)}
						className={inputClass}
					/>
				</div>

				<div className='grid grid-cols-3 gap-3'>
					<div>
						<label
							className={`block text-sm mb-1.5 ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}
						>
							Ед. изм.
						</label>
						<select
							value={unit}
							onChange={e => {
								setUnit(e.target.value)
								if (e.target.value === 'комплекс') {
									setTempQuantity(quantity)
									setQuantity(1)
								} else {
									setQuantity(tempQuantity)
								}
							}}
							className={inputClass}
						>
							{units.map(u => (
								<option
									key={u}
									value={u}
								>
									{u}
								</option>
							))}
						</select>
					</div>

					<div>
						<label
							className={`block text-sm mb-1.5 ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}
						>
							Кол-во
						</label>
						<input
							ref={quantityRef}
							disabled={unit === 'комплекс'}
							type='number'
							inputMode='decimal'
							pattern='[0-9]*[.,]?[0-9]*'
							min='0'
							step='any'
							value={quantity || ''}
							onChange={e => {
								const value = e.target.value === '' ? 0 : Number(e.target.value)
								setTempQuantity(value)
								setQuantity(value)
							}}
							className={inputClass}
						/>
					</div>

					<div>
						<label
							className={`block text-sm mb-1.5 ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}
						>
							Цена
						</label>
						<input
							type='number'
							inputMode='decimal'
							pattern='[0-9]*[.,]?[0-9]*'
							min='0'
							step='any'
							value={price || ''}
							onChange={e =>
								setPrice(e.target.value === '' ? 0 : Number(e.target.value))
							}
							className={inputClass}
						/>
					</div>
				</div>

				<div
					className={`rounded-xl px-4 py-3 flex justify-between text-sm ${
						isDark ? 'bg-neutral-800' : 'bg-slate-50'
					}`}
				>
					<span className={isDark ? 'text-neutral-400' : 'text-slate-500'}>
						Сумма
					</span>
					<span className='font-medium'>
						{(quantity * price).toLocaleString('ru-RU')} ₽
					</span>
				</div>

				<button
					type='submit'
					className={`w-full h-12 font-semibold rounded-2xl flex items-center justify-center gap-2 cursor-pointer ${
						isDark
							? 'bg-white text-black hover:bg-neutral-100'
							: 'bg-blue-600 text-white hover:bg-blue-700'
					}`}
				>
					<Save className='w-5 h-5' />
					{isNew ? 'Добавить' : 'Сохранить'}
				</button>
			</form>
			<Modal
				buttons={{
					blue: {
						title: 'Ок',
						onClick: () => setIsErrorModal(false)
					}
				}}
				description={modalMessage.description}
				isOpen={isErrorModal}
				onClose={() => setIsErrorModal(false)}
				title={modalMessage.title}
			/>
		</div>
	)
}

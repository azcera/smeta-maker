import { ArrowLeft, Eye, Moon, Sun, Trash, Truck } from 'lucide-react'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Modal from '../components/Modal'
import ListSwitcher, {
	type SwitcherOption
} from '../components/ui/ListSwitcher'
import Switcher from '../components/ui/Switcher'
import { useSmetaStore, type ViewTypes } from '../store/smetaStore'
import type { UploadResponse } from '../types'

const API_URL = import.meta.env.VITE_API_URL

export default function SettingsPage() {
	const {
		objectName,
		setObjectName,
		isDark,
		setDark,
		importedTable,
		setImportedTable,
		addParsedWorks,
		setIsTransportCost,
		isTransportCost,
		transportCost,
		setTransportCost,
		trashCost,
		setTrashCost,
		setIsTrashCost,
		isTrashCost,
		viewType,
		setViewType
	} = useSmetaStore()
	const [error, setError] = useState<string | null>(null)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [loading, setLoading] = useState(false)
	const navigate = useNavigate()
	const fileInputRef = useRef<HTMLInputElement>(null)

	const inputNameRef = useRef<HTMLInputElement>(null)

	const handleButtonClick = () => {
		fileInputRef.current?.click()
	}
	const [searchParams] = useSearchParams()

	useEffect(() => {
		if (searchParams.get('focus') === 'true') {
			inputNameRef.current?.focus()
		}
	}, [searchParams])

	useEffect(() => {
		if (error) {
		}
	}, [error])

	useEffect(() => {
		document.title = 'Создатель смет | Настройки'
	}, [])

	const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
		try {
			if (e.target.files && e.target.files.length > 0) {
				const formData = new FormData()
				if (!e.target.files[0]) {
					setError('Пожалуйста, выберите файл')
					return
				}

				setError(null)

				formData.append('excel_file', e.target.files[0])
				const response = await fetch(`${API_URL}/upload-smeta`, {
					method: 'POST',
					body: formData
				})

				const json: UploadResponse = await response.json()

				if (!response.ok) {
					throw new Error(json.error || 'Ошибка при загрузке файла')
				}

				setImportedTable(e.target.files[0].name)

				if (json.data.object) {
					setObjectName(json.data.object)
				}

				if (json.data.transportCost) {
					setIsTransportCost(true)
					setTransportCost(json.data.transportCost)
				}

				if (json.data.trashCost) {
					setIsTrashCost(true)
					setTrashCost(json.data.trashCost)
				}

				addParsedWorks(json.data.places)
			}
		} catch (err: any) {
			setError(err.message || 'Произошла неизвестная ошибка')
		} finally {
			setLoading(false)
		}
	}

	const handleCostChange = (
		e: ChangeEvent<HTMLInputElement>,
		f: (value: number) => void
	) => {
		let inputValue = e.target.value

		if (inputValue.length > 1 && inputValue.startsWith('0')) {
			inputValue = inputValue.replace(/^0+/, '')
		}

		if (inputValue === '00') {
			return
		}

		let numericValue = Number(inputValue)

		if (numericValue < 0) {
			numericValue = 0
		}

		if (inputValue === '' || isNaN(numericValue)) {
			f(0)
		} else {
			f(numericValue)
		}
	}

	const viewTypeOptions: SwitcherOption<ViewTypes>[] = [
		{ id: 'QUANTITY', name: 'Цена за единицу' },
		{ id: 'TOTAL', name: 'Общая стоимость' }
	]

	return (
		<div className='space-y-6 max-w-md mx-auto'>
			{/* Назад */}
			<div className='flex items-center gap-3'>
				<button
					onClick={() => navigate('/')}
					className={`p-2 -ml-2 rounded-xl transition-colors cursor-pointer ${
						isDark ? 'hover:bg-neutral-800' : 'hover:bg-slate-200'
					}`}
				>
					<ArrowLeft className='w-5 h-5' />
				</button>
				<div>
					<h1 className='text-xl font-bold'>Настройки</h1>
					<p
						className={`text-sm ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}
					>
						Параметры сметы
					</p>
				</div>
			</div>

			{/* Название объекта */}
			<div
				className={`rounded-2xl p-5 space-y-3 ${
					isDark
						? 'bg-neutral-900'
						: 'bg-white border border-slate-200 shadow-sm'
				}`}
			>
				<label
					className={`block text-sm ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}
				>
					Название объекта
				</label>
				<input
					value={objectName}
					ref={inputNameRef}
					onChange={e => setObjectName(e.target.value)}
					placeholder='Например: Квартира ул. Ленина 15'
					className={`w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
						isDark
							? 'bg-neutral-800 border border-neutral-700 text-white '
							: 'bg-slate-50 border border-slate-200 text-slate-900 '
					}`}
				/>
			</div>

			{/* Импорт таблицы */}
			<div>
				<input
					ref={fileInputRef}
					type='file'
					accept='.xlsx, .xls'
					onChange={handleFileChange}
					className={`hidden`}
				/>
				<button
					onClick={handleButtonClick}
					disabled={loading}
					className={`w-full py-3 rounded-xl border border-dashed text-sm cursor-pointer transition-colors ${
						isDark
							? 'border-neutral-700 text-neutral-400 hover:bg-neutral-900'
							: 'border-slate-300 text-slate-500 hover:bg-slate-50'
					}`}
				>
					{loading
						? 'Загрузка...'
						: !importedTable
							? 'Импортировать таблицу'
							: `Загруженная таблица: ${importedTable}`}
				</button>
				{error && (
					<p
						role='alert'
						className='mt-2 text-sm text-red-500'
					>
						{error}
					</p>
				)}
			</div>

			<Switcher
				icons={{ dark: Moon, light: Sun }}
				description={{ dark: 'Сейчас включена', light: 'Сейчас выключена' }}
				switchable={isDark}
				setSwitchable={setDark}
				title='Тёмная тема'
			/>

			<ListSwitcher
				icons={{ dark: Eye }}
				description=''
				title='Режим отображения'
				options={viewTypeOptions}
				setValue={setViewType}
				value={viewType}
			/>

			<Switcher
				icons={{ dark: Truck }}
				description={{
					dark: 'Сейчас учитываются',
					light: 'Сейчас  не учитываются'
				}}
				switchable={isTransportCost}
				setSwitchable={setIsTransportCost}
				title='Транспортные расходы'
				inputValue={transportCost.toString()}
				onInputChange={e => handleCostChange(e, setTransportCost)}
			/>

			<Switcher
				icons={{ dark: Trash }}
				description={{
					dark: 'Сейчас учитывается',
					light: 'Сейчас  не учитывается'
				}}
				switchable={isTrashCost}
				setSwitchable={setIsTrashCost}
				title='Вынос мусора'
				inputValue={trashCost.toString()}
				onInputChange={e => handleCostChange(e, setTrashCost)}
			/>
			<Modal
				title='Ошибка'
				buttons={{
					blue: {
						onClick: () => setIsModalOpen(false),
						title: 'Ок'
					}
				}}
				onClose={() => setIsModalOpen(false)}
				description={error as string}
				isOpen={isModalOpen}
			/>
		</div>
	)
}

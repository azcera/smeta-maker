import { ArrowLeft, Building, Eye, Moon, Sun, Trash, Truck } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Modal from '../../components/Modal'
import type { ViewTypes } from '../../store/smetaStore'
import { FileImporter } from './components/FileImporter'
import ListSwitcher, { type SwitcherOption } from './components/ListSwitcher'
import Switcher from './components/Switcher'
import { useSettings } from './hooks/useSettings'

export default function SettingsPage() {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const [isModalOpen, setIsModalOpen] = useState(false)
	const inputNameRef = useRef<HTMLInputElement>(null)

	const {
		places,
		objectName,
		setObjectName,
		isDark,
		setDark,
		importedTable,
		viewType,
		setViewType,
		isMultiplePlaces,
		setIsMultiplePlaces,
		isTransportCost,
		setIsTransportCost,
		transportCost,
		setTransportCost,
		isTrashCost,
		setIsTrashCost,
		trashCost,
		setTrashCost,
		error,
		loading,
		fileInputRef,
		handleFileChange,
		handleCostChange
	} = useSettings()

	useEffect(() => {
		if (searchParams.get('focus') === 'true') {
			inputNameRef.current?.focus()
		}
	}, [searchParams])

	useEffect(() => {
		document.title = 'Создатель смет | Настройки'
	}, [])

	const viewTypeOptions: SwitcherOption<ViewTypes>[] = [
		{ id: 'QUANTITY', name: 'Цена за единицу' },
		{ id: 'TOTAL', name: 'Общая стоимость' }
	]

	return (
		<div className='space-y-6 max-w-md mx-auto'>
			{/* Хедер */}
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
				className={`rounded-2xl p-5 space-y-3 ${isDark ? 'bg-neutral-900' : 'bg-white border border-slate-200 shadow-sm'}`}
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
							? 'bg-neutral-800 border border-neutral-700 text-white'
							: 'bg-slate-50 border border-slate-200 text-slate-900'
					}`}
				/>
			</div>

			{/* Импорт таблицы */}
			<FileImporter
				fileInputRef={fileInputRef}
				loading={loading}
				importedTable={importedTable}
				error={error}
				onFileChange={handleFileChange}
				isDark={isDark}
			/>

			{/* Переключатели */}
			<Switcher
				icons={{ dark: Moon, light: Sun }}
				description={{
					enabled: 'Сейчас включена',
					disabled: 'Сейчас выключена'
				}}
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
			{places.length > 1 ? null : (
				<Switcher
					icons={{ dark: Building }}
					description={{
						enabled: 'Сейчас включено',
						disabled: 'Сейчас выключена'
					}}
					switchable={isMultiplePlaces}
					setSwitchable={setIsMultiplePlaces}
					title='Использование нескольких помещений'
				/>
			)}

			<Switcher
				icons={{ dark: Truck }}
				description={{
					enabled: 'Сейчас учитываются',
					disabled: 'Сейчас не учитываются'
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
					enabled: 'Сейчас учитывается',
					disabled: 'Сейчас не учитывается'
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
					blue: { onClick: () => setIsModalOpen(false), title: 'Ок' }
				}}
				onClose={() => setIsModalOpen(false)}
				description={error as string}
				isOpen={isModalOpen}
			/>
		</div>
	)
}

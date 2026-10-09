import { Save } from 'lucide-react'
import type { RefObject, SubmitEvent } from 'react'
import { Header } from '../../../components/layout/Header'

interface WorkFormStepProps {
	isNew: boolean
	isDark: boolean
	currentPlaceName?: string
	name: string
	setName: (val: string) => void
	unit: string
	setUnit: (val: string) => void
	units: string[]
	quantity: number
	setQuantity: (val: number) => void
	price: number
	setPrice: (val: number) => void
	tempQuantity: number
	setTempQuantity: (val: number) => void
	quantityRef: RefObject<HTMLInputElement | null>
	onBack: () => void
	onSubmit: (e: SubmitEvent) => void
}

export function WorkFormStep({
	isNew,
	isDark,
	currentPlaceName,
	name,
	setName,
	unit,
	setUnit,
	units,
	quantity,
	setQuantity,
	price,
	setPrice,
	tempQuantity,
	setTempQuantity,
	quantityRef,
	onBack,
	onSubmit
}: WorkFormStepProps) {
	const inputClass = `w-full px-4 py-3 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
		isDark
			? 'bg-neutral-900 border border-neutral-700 text-white placeholder:text-neutral-500'
			: 'bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400'
	}`

	return (
		<div
			id='editingPage'
			className={`max-w-md mx-auto flex flex-col h-dvh overflow-hidden relative w-full touch-none ${
				isDark ? 'bg-neutral-950' : 'bg-slate-100'
			}`}
		>
			<Header
				subtitle={currentPlaceName}
				title={isNew ? 'Новая работа' : 'Редактирование'}
				onBackClick={onBack}
			/>

			<form
				onSubmit={onSubmit}
				className='no-scrollbar flex flex-col w-full flex-1 space-y-4 px-4 pb-10 overflow-hidden'
				style={{
					paddingTop: 'calc(56px + 1rem + env(safe-area-inset-top, 0px))'
				}}
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
							id='countInput'
							ref={quantityRef}
							disabled={unit === 'комплекс'}
							type='number'
							inputMode='decimal'
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
							value={price || ''}
							onChange={e =>
								setPrice(e.target.value === '' ? 0 : Number(e.target.value))
							}
							className={inputClass}
						/>
					</div>
				</div>

				<div
					className={`rounded-xl px-4 py-3 flex justify-between text-sm ${isDark ? 'bg-neutral-800' : 'bg-slate-50'}`}
				>
					<span className={isDark ? 'text-neutral-400' : 'text-slate-500'}>
						Сумма
					</span>
					<span className='font-medium'>
						{(quantity * price).toLocaleString('ru-RU')} ₽
					</span>
				</div>

				<button
					id='addWorkButton'
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
		</div>
	)
}

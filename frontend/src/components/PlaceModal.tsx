import { X } from 'lucide-react'
import { useEffect, useRef, useState, type SubmitEvent } from 'react'
import { useSmetaStore } from '../store/smetaStore'

interface Props {
	open: boolean
	onClose: () => void
	value?: string
	placeId?: string
}

export default function PlaceModal({
	open,
	onClose,
	value = '',
	placeId
}: Props) {
	const { addPlace, isDark, renamePlace } = useSmetaStore()
	const [name, setName] = useState(value)
	const inputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		if (!open) return
		setName(value)
		// после paint модалки
		const t = requestAnimationFrame(() => {
			inputRef.current?.focus()
		})
		return () => cancelAnimationFrame(t)
	}, [open, value])

	if (!open) return null

	const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (!name.trim()) return
		if (value.length > 0) {
			if (placeId) {
				renamePlace(placeId, name.trim())
			}
		} else {
			addPlace(name.trim())
		}
		onClose()
	}

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
			{/* Затемнение */}
			<div
				className='absolute inset-0 bg-black/60 backdrop-blur-sm'
				onClick={onClose}
			/>

			{/* Модалка */}
			<div
				className={`relative w-full max-w-sm rounded-2xl p-6 shadow-xl ${
					isDark ? 'bg-neutral-900' : 'bg-white'
				}`}
			>
				<div className='flex items-center justify-between mb-5'>
					<h2 className='text-lg font-semibold'>
						{value.length > 0 ? 'Редактирование помещения' : 'Новое помещение'}
					</h2>
					<button
						onClick={onClose}
						className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
							isDark ? 'hover:bg-neutral-800' : 'hover:bg-slate-100'
						}`}
					>
						<X className='w-5 h-5' />
					</button>
				</div>

				<form
					onSubmit={handleSubmit}
					className='space-y-4'
				>
					<div>
						<label
							className={`block text-sm mb-1.5 ${
								isDark ? 'text-neutral-400' : 'text-slate-600'
							}`}
						>
							Название помещения
						</label>
						<input
							ref={inputRef}
							value={name}
							spellCheck
							onChange={e => {
								let value =
									e.target.value.length === 1
										? e.target.value.toUpperCase()
										: e.target.value

								setName(value)
							}}
							placeholder='Например: Кухня, Ванная, Коридор...'
							className={`w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
								isDark
									? 'bg-neutral-800 border border-neutral-700 text-white '
									: 'bg-slate-50 border border-slate-200 text-slate-900 '
							}`}
						/>
					</div>
					<div className='flex gap-3 pt-1'>
						<button
							type='button'
							onClick={onClose}
							className={`flex-1 h-11 rounded-xl text-sm font-medium cursor-pointer transition-colors ${
								isDark
									? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
									: 'bg-slate-100 hover:bg-slate-200 text-slate-700'
							}`}
						>
							Отмена
						</button>
						<button
							type='submit'
							disabled={name.trim() === value}
							className={`flex-1 h-11 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50  ${name.trim() === value ? 'cursor-not-allowed' : 'cursor-pointer'}`}
						>
							{value.length > 0 ? 'Изменить' : 'Добавить'}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useSmetaStore } from '../store/smetaStore'

interface Props {
	open: boolean
	onClose: () => void
}

export default function AddPlaceModal({ open, onClose }: Props) {
	const { addPlace, isDark } = useSmetaStore()
	const [name, setName] = useState('')
	const inputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		if (open) {
			setName('')
			setTimeout(() => inputRef.current?.focus(), 50)
		}
	}, [open])

	if (!open) return null

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (!name.trim()) return
		addPlace(name.trim())
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
					<h2 className='text-lg font-semibold'>Новое помещение</h2>
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
							onChange={e => setName(e.target.value)}
							placeholder='Например: Кухня, Ванная, Коридор...'
							className={`w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
								isDark
									? 'bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-500'
									: 'bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400'
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
							disabled={!name.trim()}
							className='flex-1 h-11 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
						>
							Добавить
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

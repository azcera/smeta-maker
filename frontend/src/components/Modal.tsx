import { X } from 'lucide-react'
import { useSmetaStore } from '../store/smetaStore'

type ButtonType = {
	title: string
	onClick: () => void
}

interface Props {
	isOpen: boolean
	onClose: () => void
	title: string
	description: string
	buttons: {
		grey?: ButtonType
		blue: ButtonType
	}
}

export default function Modal({
	isOpen,
	onClose,
	title,
	description,
	buttons
}: Props) {
	const { isDark } = useSmetaStore()

	if (!isOpen) return null

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
					<h2 className='text-lg font-semibold'>{title}</h2>
					<button
						onClick={onClose}
						className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
							isDark ? 'hover:bg-neutral-800' : 'hover:bg-slate-100'
						}`}
					>
						<X className='w-5 h-5' />
					</button>
				</div>

				<div>
					<label
						className={`block text-sm mb-5 ${
							isDark ? 'text-neutral-400' : 'text-slate-600'
						}`}
					>
						{description}
					</label>
				</div>

				<div className='flex gap-3 pt-1'>
					{buttons.grey ? (
						<button
							type='button'
							onClick={buttons.grey.onClick}
							className={`flex-1 h-11 rounded-xl text-sm font-medium cursor-pointer transition-colors ${
								isDark
									? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
									: 'bg-slate-100 hover:bg-slate-200 text-slate-700'
							}`}
						>
							{buttons.grey.title}
						</button>
					) : null}

					<button
						id='blueModalButton'
						type='button'
						onClick={buttons.blue.onClick}
						className='flex-1 h-11 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
					>
						{buttons.blue.title}
					</button>
				</div>
			</div>
		</div>
	)
}

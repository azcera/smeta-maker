import { Download, Settings, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSmetaStore } from '../../../store/smetaStore'

interface BottomActionBarProps {
	total: number
	allWorksCount: number
	saving: boolean
	onDeleteClick: () => void
	onSaveClick: () => void
}

export function BottomActionBar({
	total,
	allWorksCount,
	saving,
	onDeleteClick,
	onSaveClick
}: BottomActionBarProps) {
	const { isDark, viewType, setViewType } = useSmetaStore()

	return (
		<div
			className={`fixed bottom-0 left-0 right-0 z-20 ${isDark ? 'bg-neutral-950' : 'bg-white'}`}
		>
			<div className='max-w-2xl mx-auto px-4 py-4'>
				<div className='flex justify-center mb-4'>
					<button
						onClick={() =>
							setViewType(viewType === 'QUANTITY' ? 'TOTAL' : 'QUANTITY')
						}
						className={`cursor-pointer px-4 py-1.5 rounded-full text-sm ${isDark ? 'bg-neutral-800 text-neutral-300' : 'bg-slate-100 text-slate-600'}`}
					>
						Итого:{' '}
						<span
							className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}
						>
							{total.toLocaleString('ru-RU')} ₽
						</span>
					</button>
				</div>

				<div className='flex items-center gap-3'>
					<button
						onClick={onDeleteClick}
						className='h-12 px-4 rounded-2xl bg-red-500/90 hover:bg-red-500 flex items-center justify-center transition-colors cursor-pointer shrink-0'
					>
						<Trash2 className='w-5 h-5 text-white' />
					</button>

					<button
						onClick={onSaveClick}
						disabled={saving || allWorksCount === 0}
						className={`flex-1 h-12 rounded-2xl font-semibold text-base transition-colors cursor-pointer flex items-center justify-center gap-2 ${
							isDark
								? 'bg-white text-black hover:bg-neutral-100'
								: 'bg-blue-600 text-white hover:bg-blue-700'
						} disabled:opacity-40 disabled:cursor-not-allowed`}
					>
						{saving ? (
							'Создание...'
						) : (
							<>
								<Download className='w-5 h-5' />
								Скачать смету
							</>
						)}
					</button>

					<Link
						to='/settings'
						className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors cursor-pointer ${isDark ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
					>
						<Settings className='w-5 h-5' />
					</Link>
				</div>
			</div>
		</div>
	)
}

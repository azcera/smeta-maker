import { ArrowLeft, Search } from 'lucide-react'
import type { NormalizedWork } from '../../../types'

interface WorkSearchStepProps {
	query: string
	setQuery: (val: string) => void
	filteredWorks: NormalizedWork[]
	loading: boolean
	error: string
	isDark: boolean
	currentPlaceName?: string
	onBack: () => void
	onSelectWork: (item: NormalizedWork) => void
	onGoToManual: () => void
	nameInputRef: React.RefObject<HTMLInputElement | null>
}

export function WorkSearchStep({
	query,
	setQuery,
	filteredWorks,
	loading,
	error,
	isDark,
	currentPlaceName,
	onBack,
	onSelectWork,
	onGoToManual,
	nameInputRef
}: WorkSearchStepProps) {
	const inputClass = `w-full px-4 py-3 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
		isDark
			? 'bg-neutral-900 border border-neutral-700 text-white placeholder:text-neutral-500'
			: 'bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400'
	}`

	return (
		<div className='max-w-md mx-auto flex flex-col h-[calc(100vh-3rem)]'>
			<div className='sticky top-0 z-10 pb-4 space-y-4'>
				<div className='flex items-center gap-3'>
					<button
						onClick={onBack}
						className={`p-2 -ml-2 rounded-xl cursor-pointer ${isDark ? 'hover:bg-neutral-800' : 'hover:bg-slate-200'}`}
					>
						<ArrowLeft className='w-5 h-5' />
					</button>
					<div>
						<h1 className='text-xl font-bold'>Новая работа</h1>
						{currentPlaceName && (
							<p
								className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}
							>
								{currentPlaceName}
							</p>
						)}
					</div>
				</div>

				<div className='relative'>
					<Search
						className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}
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
					filteredWorks.length > 0 &&
					filteredWorks.slice(0, 50).map(item => (
						<button
							key={item.id}
							onClick={() => onSelectWork(item)}
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

				{query.length > 1 && !loading && filteredWorks.length === 0 && (
					<div className='text-center py-8'>
						<p
							className={`text-sm mb-4 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}
						>
							Ничего не найдено
						</p>
						<button
							onClick={onGoToManual}
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

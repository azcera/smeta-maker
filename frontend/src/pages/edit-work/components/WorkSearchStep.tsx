import { Search } from 'lucide-react'
import { useRef, useState } from 'react'
import { Header } from '../../../components/layout/Header'
import { useSmetaStore } from '../../../store/smetaStore'
import type { NormalizedWork } from '../../../types'
import { CategoryComponent } from './CategoryComponent'
import SearchComponent from './SearchComponent'

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
	const [isHeaderVisible, setIsHeaderVisible] = useState(true)
	const [isInputFocused, setIsInputFocused] = useState(false)
	const lastScrollY = useRef(0)
	const { isSearchMethod } = useSmetaStore()
	const [openedCategory, setOpenedCategory] = useState<string | null>(null)

	const inputClass = `w-full px-4 py-3 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
		isDark
			? 'bg-neutral-900 border border-neutral-700 text-white placeholder:text-neutral-500'
			: 'bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400'
	}`

	const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
		if (isInputFocused) return

		const currentScrollY = e.currentTarget.scrollTop
		const maxScroll =
			e.currentTarget.scrollHeight - e.currentTarget.clientHeight

		if (currentScrollY > lastScrollY.current && currentScrollY > 10) {
			setIsHeaderVisible(false)
		} else if (
			currentScrollY < lastScrollY.current ||
			currentScrollY <= 5 ||
			currentScrollY >= maxScroll - 5
		) {
			setIsHeaderVisible(true)
		}

		lastScrollY.current = currentScrollY
	}
	const uniqueCategories: string[] = [
		...new Set(filteredWorks.map(work => work.category))
	]

	return (
		<div
			className={`max-w-md mx-auto flex flex-col h-full overflow-hidden relative w-full ${
				isDark ? 'bg-neutral-950' : 'bg-slate-100'
			}`}
		>
			<Header
				onBackClick={openedCategory ? () => setOpenedCategory(null) : onBack}
				subtitle={currentPlaceName}
				title='Новая работа'
				headerClasses={`${
					isInputFocused
						? 'translate-y-0 opacity-100 transition-none'
						: 'transition-transform duration-300 ease-in-out'
				} ${
					!isInputFocused && !isHeaderVisible
						? '-translate-y-full opacity-0 pointer-events-none'
						: 'translate-y-0 opacity-100'
				}`}
				child={
					<>
						{isSearchMethod ? (
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
									onFocus={() => {
										setIsHeaderVisible(true)
										setIsInputFocused(true)
									}}
									onBlur={() => setIsInputFocused(false)}
								/>
							</div>
						) : null}

						{loading && (
							<p className='text-sm text-center text-neutral-400'>
								Загрузка базы...
							</p>
						)}
						{error && (
							<p className='text-sm text-center text-red-400'>{error}</p>
						)}
					</>
				}
			/>

			<div
				onScroll={handleScroll}
				className='app-scroll no-scrollbar flex flex-col w-full flex-1 space-y-2 pb-10'
				style={{
					paddingTop: isSearchMethod
						? 'calc(120px + 1rem + env(safe-area-inset-top, 0px))'
						: 'calc(56px + 1rem + env(safe-area-inset-top, 0px))'
				}}
			>
				{query.length > 1 &&
					!loading &&
					filteredWorks.length > 0 &&
					filteredWorks.slice(0, 50).map(item => {
						if (openedCategory && item.category != openedCategory) return null
						return (
							<SearchComponent
								key={item.id || item.name}
								item={item}
								onSelectWork={onSelectWork}
							/>
						)
					})}
				{query.length < 1 &&
					!openedCategory &&
					uniqueCategories.map(c => (
						<CategoryComponent
							key={c}
							item={c}
							onSelectCategory={() => setOpenedCategory(c)}
						/>
					))}
				{query.length < 1 && !openedCategory && (
					<button
						onClick={onGoToManual}
						className='px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium cursor-pointer'
					>
						Создать вручную
					</button>
				)}

				{query.length === 1 && (
					<div
						className={`items-center justify-center text-center text-s ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}
					>
						Продолжайте вводить поисковый запрос
					</div>
				)}

				{(query.length > 1 || openedCategory) &&
					query.length != 1 &&
					filteredWorks.map(item => {
						if (item.category != openedCategory) return null
						return (
							<SearchComponent
								key={item.id || item.name}
								item={item}
								onSelectWork={onSelectWork}
							/>
						)
					})}

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

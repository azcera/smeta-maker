import { useSmetaStore } from '../../../store/smetaStore'
import type { NormalizedWork } from '../../../types'

interface SearchComponentProps {
	item: NormalizedWork
	onSelectWork: (item: NormalizedWork) => void
}

export default function SearchComponent({
	item,
	onSelectWork
}: SearchComponentProps) {
	const { isDark } = useSmetaStore()
	return (
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
	)
}

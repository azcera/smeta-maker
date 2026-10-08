import { ChevronRight } from 'lucide-react'
import { useSmetaStore } from '../../../store/smetaStore'

interface Props {
	item: string
	onSelectCategory: () => void
}

export function CategoryComponent({ item, onSelectCategory }: Props) {
	const { isDark } = useSmetaStore()
	return (
		<div
			key={item}
			onClick={onSelectCategory}
			className={`w-full flex justify-between text-left px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
				isDark
					? 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800'
					: 'bg-white border-slate-200 hover:bg-slate-50'
			}`}
		>
			<p className='text-sm font-medium'>{item}</p>
			<ChevronRight />
		</div>
	)
}

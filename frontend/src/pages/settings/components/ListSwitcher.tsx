import { type LucideIcon, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useSmetaStore } from '../../../store/smetaStore'

interface Props<T extends string> {
	icons: {
		dark: LucideIcon
		light?: LucideIcon
	}
	value: T
	setValue: (value: T) => void
	title: string
	description: string
	options: SwitcherOption<T>[]
}

export type SwitcherOption<T extends string> = {
	id: T
	name: string
}

export default function ListSwitcher<T extends string>({
	value,
	icons,
	setValue,
	title,
	description,
	options
}: Props<T>) {
	const { isDark } = useSmetaStore()

	if (!icons.light) {
		icons.light = icons.dark
	}
	const IconToRender = isDark ? icons.dark : icons.light || icons.dark

	const [isOpen, setIsOpen] = useState(false)

	return (
		<div
			className={`rounded-2xl p-5 ${
				isDark ? 'bg-neutral-900' : 'bg-white border border-slate-200 shadow-sm'
			}`}
		>
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-3'>
					<IconToRender
						className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-amber-500'}`}
					/>
					<div>
						<p className='font-medium text-sm'>{title}</p>
						<p
							className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}
						>
							{description}
						</p>
					</div>
				</div>
				<div className='relative inline-grid max-w-full text-sm'>
					{/* Кнопка-триггер */}
					<div
						className={`${isDark ? 'bg-neutral-800 text-white' : 'bg-slate-50 text-black'} 
          flex items-center justify-between gap-3 rounded-lg p-1.5 cursor-pointer select-none`}
						onClick={() => setIsOpen(!isOpen)}
					>
						<div className='grid grid-cols-1 grid-rows-1 min-w-0'>
							{options.map(v => {
								const isSelected = v.id === value
								return (
									<span
										key={v.id}
										className={`col-start-1 row-start-1 whitespace-normal wrap-break-words transition-opacity
                  ${isSelected ? 'opacity-100' : 'opacity-0 invisible pointer-events-none'}`}
									>
										{v.name}
									</span>
								)
							})}
						</div>

						<ChevronDown
							size={16}
							className={`shrink-0 ${isDark ? 'text-neutral-400' : 'text-slate-500'} transition-transform ${isOpen ? 'rotate-180' : ''}`}
						/>
					</div>

					{/* Выпадающее меню */}
					{isOpen && (
						<ul
							className={`${isDark ? 'bg-neutral-800 text-white' : 'bg-white text-black'} absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-lg border p-1 shadow-lg`}
						>
							{options.map(v => (
								<li
									key={v.id}
									className='cursor-pointer rounded-md p-2 hover:bg-neutral-700'
									onClick={() => {
										setValue(v.id)
										setIsOpen(false)
									}}
								>
									{v.name}
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
		</div>
	)
}

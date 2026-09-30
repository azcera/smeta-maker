import type { LucideIcon } from 'lucide-react'
import { useSmetaStore } from '../../store/smetaStore'

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

				<select
					value={value}
					onChange={e => setValue(e.target.value as T)}
					className={`outline-0 rounded-lg p-1.5 text-sm ${isDark ? 'bg-neutral-800 text-white' : 'bg-slate-50'}`}
				>
					{options.map(v => (
						<option
							key={v.id}
							value={v.id}
						>
							{v.name}
						</option>
					))}
				</select>
			</div>
		</div>
	)
}

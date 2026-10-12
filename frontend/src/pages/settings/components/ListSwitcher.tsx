import { ChevronDown, type LucideIcon } from 'lucide-react'
import { useSmetaStore } from '../../../store/smetaStore'

interface Props<T extends string> {
	icons: {
		dark: LucideIcon
		light?: LucideIcon
	}
	value: T
	setValue: (value: T) => void
	title: string
	description?: string
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

	const IconToRender = isDark ? icons.dark : icons.light || icons.dark

	return (
		<div
			className={`select-none rounded-2xl p-5 ${
				isDark ? 'bg-neutral-900' : 'bg-white border border-slate-200 shadow-sm'
			}`}
		>
			<div className='flex items-center justify-between'>
				<div className='flex-1 flex items-center gap-3'>
					<IconToRender
						className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-amber-500'}`}
					/>
					<div>
						<p className='font-medium text-sm'>{title}</p>
						{description ? (
							<p
								className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}
							>
								{description}
							</p>
						) : null}
					</div>
				</div>
				<div
					className={`flex p-2 justify-center items-center gap-3 rounded-lg  cursor-pointer select-none  relative max-w-full text-sm ${isDark ? 'bg-neutral-800 text-white' : 'bg-slate-50 text-black'}`}
				>
					<select
						value={value}
						onChange={e => {
							setValue(e.target.value as T)
						}}
						className={`${isDark ? 'bg-neutral-800 text-white' : 'bg-slate-50 text-black'} pr-8 focus:outline-0 
          appearance-none `}
					>
						{options.map(o => (
							<option
								key={o.id}
								value={o.id}
							>
								{o.name}
							</option>
						))}
					</select>
					<ChevronDown className='w-5 h-5 right-4 absolute pointer-events-none' />
				</div>
			</div>
		</div>
	)
}

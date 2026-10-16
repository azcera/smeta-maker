import { type LucideIcon } from 'lucide-react'
import {
	SelectComponent,
	type SwitcherOption
} from '../../../components/SelectComponent'
import { useSmetaStore } from '../../../store/smetaStore'

interface Props {
	icons: {
		dark: LucideIcon
		light?: LucideIcon
	}
	value: string
	setValue: (value: string) => void
	title: string
	description?: string
	options: SwitcherOption[]
}

export default function ListSwitcher({
	value,
	icons,
	setValue,
	title,
	description,
	options
}: Props) {
	const { isDark } = useSmetaStore()

	const IconToRender = isDark ? icons.dark : icons.light || icons.dark

	return (
		<div
			className={`select-none rounded-2xl p-5 ${
				isDark ? 'bg-neutral-900' : 'bg-white border border-slate-200 shadow-sm'
			}`}
		>
			<div className='flex items-center justify-between gap-2'>
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

				<SelectComponent
					name={title}
					options={options}
					setValue={setValue}
					value={value}
				/>
			</div>
		</div>
	)
}

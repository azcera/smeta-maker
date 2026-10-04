import type { LucideIcon } from 'lucide-react'
import type { ChangeEvent } from 'react'
import { useSmetaStore } from '../../../store/smetaStore'

interface Props {
	icons: {
		dark: LucideIcon
		light?: LucideIcon
	}
	switchable: boolean
	setSwitchable: (value: boolean) => void
	title: string
	description: {
		enabled: string
		disabled: string
	}
	inputValue?: string
	onInputChange?: (e: ChangeEvent<HTMLInputElement>) => void
}

export default function Switcher({
	icons,
	switchable,
	setSwitchable,
	title,
	description,
	inputValue,
	onInputChange
}: Props) {
	const { isDark } = useSmetaStore()

	if (!icons.light) {
		icons.light = icons.dark
	}

	return (
		<div
			className={`rounded-2xl p-5 ${
				isDark ? 'bg-neutral-900' : 'bg-white border border-slate-200 shadow-sm'
			}`}
		>
			<div className='flex items-center justify-between '>
				<div className='flex items-center gap-3'>
					{isDark ? (
						<icons.dark className='w-5 h-5 text-blue-400' />
					) : (
						<icons.light className='w-5 h-5 text-amber-500' />
					)}
					<div>
						<p className='font-medium text-sm'>{title}</p>
						<p
							className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}
						>
							{switchable ? description.enabled : description.disabled}
						</p>
					</div>
				</div>

				<button
					onClick={() => setSwitchable(!switchable)}
					className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
						switchable ? 'bg-blue-600' : 'bg-slate-300'
					} `}
				>
					<div
						className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
							switchable ? 'translate-x-6' : 'translate-x-1'
						}`}
					/>
				</button>
			</div>
			{inputValue ? (
				<>
					<div
						className={`flex items-center mt-5 space-x-5 ${switchable ? 'opacity-100' : 'opacity-30'}`}
					>
						<input
							type='text'
							disabled={!switchable}
							inputMode='numeric'
							min='0'
							value={inputValue}
							onChange={onInputChange}
							className={` w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
								isDark
									? 'bg-neutral-800 border border-neutral-700 text-white '
									: 'bg-slate-50 border border-slate-200 text-slate-900 '
							}
					
					`}
						/>
						<label htmlFor=''>руб.</label>
					</div>
				</>
			) : null}
		</div>
	)
}

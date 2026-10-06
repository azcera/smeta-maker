import { ArrowLeft } from 'lucide-react'
import type { ReactElement } from 'react'
import { useSmetaStore } from '../../store/smetaStore'

interface Props {
	onBackClick: () => void
	title: string
	subtitle?: string
	headerClasses?: string
	child?: ReactElement
}

export function Header({
	onBackClick,
	subtitle,
	title,
	headerClasses,
	child
}: Props) {
	const { isDark } = useSmetaStore()
	return (
		<div
			className={`${isDark ? 'bg-neutral-950' : 'bg-slate-100'} fixed top-0 left-0 right-0 z-20 px-4 pb-4 space-y-4 max-w-md mx-auto ${headerClasses}`}
			style={{
				paddingTop: 'calc(1rem + env(safe-area-inset-top))'
			}}
		>
			<div className='flex items-center gap-3'>
				<button
					onClick={onBackClick}
					className={`p-2 -ml-2 rounded-xl cursor-pointer ${isDark ? 'hover:bg-neutral-800' : 'hover:bg-slate-200'}`}
				>
					<ArrowLeft className='w-5 h-5' />
				</button>
				<div>
					<h1 className='text-xl font-bold'>{title}</h1>
					{subtitle && (
						<p
							className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}
						>
							{subtitle}
						</p>
					)}
				</div>
			</div>
			{child}
		</div>
	)
}

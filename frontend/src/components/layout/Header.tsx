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
			className={`fixed top-0 left-0 right-0 z-20 px-4 pb-4 space-y-4 ${
				isDark ? 'bg-neutral-950' : 'bg-slate-100'
			} ${headerClasses ?? ''}`}
			style={{
				paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))',
				paddingLeft: 'max(1rem, env(safe-area-inset-left, 0px))',
				paddingRight: 'max(1rem, env(safe-area-inset-right, 0px))'
			}}
		>
			{/* центрируем контент хедера как на страницах */}
			<div className='max-w-md mx-auto w-full space-y-4'>
				<div className='flex items-center gap-3'>
					<button
						type='button'
						onClick={onBackClick}
						className={`p-2 -ml-2 rounded-xl cursor-pointer ${
							isDark ? 'hover:bg-neutral-800' : 'hover:bg-slate-200'
						}`}
					>
						<ArrowLeft className='w-5 h-5' />
					</button>
					<div>
						<h1 className='text-xl font-bold'>{title}</h1>
						{subtitle && (
							<p
								className={`text-xs ${
									isDark ? 'text-neutral-400' : 'text-slate-500'
								}`}
							>
								{subtitle}
							</p>
						)}
					</div>
				</div>
				{child}
			</div>
		</div>
	)
}

import { useNavigate } from 'react-router-dom'
import { useSmetaStore } from '../../store/smetaStore'

interface Props {
	title: string
	desc: string
}

export function ErrorPage({ title, desc }: Props) {
	const { isDark } = useSmetaStore()
	const navigate = useNavigate()
	return (
		<div
			className={`fixed inset-0 flex flex-col items-center justify-center transition-colors ${
				isDark ? 'bg-neutral-950 text-white' : 'bg-slate-100 text-slate-900'
			} p-6 text-center text-white z-50`}
		>
			<div
				className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500`}
			>
				{/* Простая SVG-иконка предупреждения */}
				<svg
					className='h-6 w-6'
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={2}
						d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
					/>
				</svg>
			</div>
			<h1
				className={`${
					isDark ? 'bg-neutral-950 text-white' : 'bg-slate-100 text-slate-900'
				} text-base font-semibold mb-1`}
			>
				{title}
			</h1>
			<p className='text-xs text-neutral-400 max-w-60 leading-relaxed'>
				{desc}
			</p>
			<button
				className={`select-none mt-4 p-5 h-10 rounded-2xl font-semibold text-base transition-colors cursor-pointer flex items-center justify-center gap-2 ${
					isDark
						? 'bg-white text-black hover:bg-neutral-100'
						: 'bg-blue-600 text-white hover:bg-blue-700'
				} disabled:opacity-40 disabled:cursor-not-allowed`}
				onClick={() => navigate('/')}
			>
				На главную
			</button>
		</div>
	)
}

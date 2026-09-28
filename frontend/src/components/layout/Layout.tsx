import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useSmetaStore } from '../../store/smetaStore'

export default function Layout() {
	const { isDark } = useSmetaStore()

	useEffect(() => {
		const root = document.documentElement
		if (isDark) {
			root.classList.add('dark')
			document.body.style.backgroundColor = '#0a0a0a'
		} else {
			root.classList.remove('dark')
			document.body.style.backgroundColor = '#f1f5f9'
		}
	}, [isDark])

	return (
		<div
			className={`min-h-screen flex flex-col transition-colors ${
				isDark ? 'bg-neutral-950 text-white' : 'bg-slate-100 text-slate-900'
			}`}
		>
			<main className='flex-1'>
				<div className='max-w-2xl mx-auto px-4 py-6'>
					<Outlet />
				</div>
			</main>
		</div>
	)
}

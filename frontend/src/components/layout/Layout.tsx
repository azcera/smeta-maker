import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useSmetaStore } from '../../store/smetaStore'

export default function Layout() {
	const { isDark } = useSmetaStore()

	useEffect(() => {
		const root = document.documentElement
		if (isDark) {
			root.classList.add('dark')
			root.style.colorScheme = 'dark'
			document.body.style.backgroundColor = '#0a0a0a'
		} else {
			root.classList.remove('dark')
			root.style.colorScheme = 'light'
			document.body.style.backgroundColor = '#f1f5f9'
		}
	}, [isDark])

	return (
		<div
			className={`h-full w-full overflow-hidden flex flex-col transition-colors ${
				isDark ? 'bg-neutral-950 text-white' : 'bg-slate-100 text-slate-900'
			}`}
		>
			<Outlet />
		</div>
	)
}

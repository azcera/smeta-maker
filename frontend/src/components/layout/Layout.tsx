import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useSmetaStore } from '../../store/smetaStore'

export default function Layout() {
	const { isDark } = useSmetaStore()

	useEffect(() => {
		const root = document.documentElement
		if (isDark) {
			root.classList.add('dark')
			root.classList.remove('light')
			root.style.backgroundColor = '#0a0a0a'
			document.body.style.backgroundColor = '#0a0a0a'
		} else {
			root.classList.remove('dark')
			root.classList.add('light')
			root.style.backgroundColor = '#f1f5f9'
			document.body.style.backgroundColor = '#f1f5f9'
		}
		const themeColorMeta = document.querySelector('meta[name="theme-color"]')
		if (themeColorMeta) {
			themeColorMeta.setAttribute('content', isDark ? '#0a0a0a' : '#f1f5f9')
		}
	}, [isDark])

	return (
		<div
			className={`flex-1 h-full w-full overflow-y-auto flex flex-col transition-colors ${
				isDark ? 'bg-neutral-950 text-white' : 'bg-slate-100 text-slate-900'
			}`}
		>
			<Outlet />
		</div>
	)
}

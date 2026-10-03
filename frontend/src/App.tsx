import { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import EditWorkPage from './pages/EditWorkPage'
import HomePage from './pages/HomePage'
import SettingsPage from './pages/SettingsPage'
import { useSmetaStore } from './store/smetaStore'
import { useIsScreenTooSmall } from './utils/hooks/useIsScreenTooSmall'

function App() {
	const loadDbWorks = useSmetaStore(s => s.loadDbWorks)

	useEffect(() => {
		loadDbWorks()
	}, [loadDbWorks])

	const isTooSmall = useIsScreenTooSmall(300)
	if (isTooSmall) {
		return (
			<div className='fixed inset-0 flex flex-col items-center justify-center bg-neutral-900 p-6 text-center text-white z-50 select-none'>
				<div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500'>
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
				<h1 className='text-base font-semibold mb-1 text-neutral-100'>
					Экран слишком мал
				</h1>
				<p className='text-xs text-neutral-400 max-w-60 leading-relaxed'>
					Пожалуйста, сделайте окно браузера шире или поверните устройство
					горизонтально.
				</p>
			</div>
		)
	}
	return (
		<BrowserRouter>
			<Routes>
				<Route element={<Layout />}>
					<Route
						path='/'
						element={<HomePage />}
					/>
					<Route
						path='/settings'
						element={<SettingsPage />}
					/>
					<Route
						path='/works/new'
						element={<EditWorkPage />}
					/>
					<Route
						path='/works/:placeId/:id'
						element={<EditWorkPage />}
					/>
				</Route>
			</Routes>
		</BrowserRouter>
	)
}

export default App

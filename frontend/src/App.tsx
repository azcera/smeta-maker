import { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { InteractiveTour } from './components/InteractiveTour'
import Layout from './components/layout/Layout'
import ScrollToTop from './components/ScrollToTop'
import { ErrorPage } from './components/ui/ErrorPage'
import EditWorkPage from './pages/edit-work/EditWorkPage'
import HomePage from './pages/home/HomePage'
import SettingsPage from './pages/settings/SettingsPage'
import { useSmetaStore } from './store/smetaStore'
import { useIsScreenTooSmall } from './utils/hooks/useIsScreenTooSmall'

function App() {
	const { loadDbWorks } = useSmetaStore()

	useEffect(() => {
		loadDbWorks()
	}, [])

	const isTooSmall = useIsScreenTooSmall(300)

	if (isTooSmall) {
		return (
			<ErrorPage
				title='Экран слишком мал'
				desc='Пожалуйста, сделайте окно браузера шире или поверните устройство горизонтально.'
			/>
		)
	}

	return (
		<BrowserRouter>
			<ScrollToTop />
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
					<Route
						path='*'
						element={
							<ErrorPage
								title='Ошибка 404'
								desc='Путь не найден, проверте правильность маршрута к странице сайта'
							/>
						}
					/>
				</Route>
			</Routes>
			<InteractiveTour />
		</BrowserRouter>
	)
}

export default App

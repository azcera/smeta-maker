import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import EditWorkPage from './pages/EditWorkPage'
import HomePage from './pages/HomePage'
import SettingsPage from './pages/SettingsPage'

function App() {
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

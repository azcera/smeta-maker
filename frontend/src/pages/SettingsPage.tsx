import { ArrowLeft, Moon, Sun } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSmetaStore } from '../store/smetaStore'

export default function SettingsPage() {
	const { objectName, setObjectName, isDark, setDark } = useSmetaStore()
	const navigate = useNavigate()

	return (
		<div className='space-y-6 max-w-md mx-auto'>
			{/* Назад */}
			<div className='flex items-center gap-3'>
				<button
					onClick={() => navigate('/')}
					className={`p-2 -ml-2 rounded-xl transition-colors cursor-pointer ${
						isDark ? 'hover:bg-neutral-800' : 'hover:bg-slate-200'
					}`}
				>
					<ArrowLeft className='w-5 h-5' />
				</button>
				<div>
					<h1 className='text-xl font-bold'>Настройки</h1>
					<p
						className={`text-sm ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}
					>
						Параметры сметы
					</p>
				</div>
			</div>

			{/* Название объекта */}
			<div
				className={`rounded-2xl p-5 space-y-3 ${
					isDark
						? 'bg-neutral-900'
						: 'bg-white border border-slate-200 shadow-sm'
				}`}
			>
				<label
					className={`block text-sm ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}
				>
					Название объекта
				</label>
				<input
					value={objectName}
					onChange={e => setObjectName(e.target.value)}
					placeholder='Например: Квартира ул. Ленина 15'
					className={`w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
						isDark
							? 'bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-500'
							: 'bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400'
					}`}
				/>
			</div>

			{/* Переключатель темы */}
			<div
				className={`rounded-2xl p-5 ${
					isDark
						? 'bg-neutral-900'
						: 'bg-white border border-slate-200 shadow-sm'
				}`}
			>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-3'>
						{isDark ? (
							<Moon className='w-5 h-5 text-blue-400' />
						) : (
							<Sun className='w-5 h-5 text-amber-500' />
						)}
						<div>
							<p className='font-medium text-sm'>Тёмная тема</p>
							<p
								className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}
							>
								{isDark ? 'Сейчас включена' : 'Сейчас выключена'}
							</p>
						</div>
					</div>

					<button
						onClick={() => setDark(!isDark)}
						className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
							isDark ? 'bg-blue-600' : 'bg-slate-300'
						}`}
					>
						<div
							className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
								isDark ? 'translate-x-6' : 'translate-x-1'
							}`}
						/>
					</button>
				</div>
			</div>
		</div>
	)
}

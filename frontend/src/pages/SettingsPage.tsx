import { ArrowLeft, Moon, Sun } from 'lucide-react'
import { useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSmetaStore } from '../store/smetaStore'
import type { UploadResponse } from '../types'

export default function SettingsPage() {
	const { objectName, setObjectName, isDark, setDark, addParsedWorks } =
		useSmetaStore()
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const navigate = useNavigate()

	const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
		try {
			if (e.target.files && e.target.files.length > 0) {
				const formData = new FormData()
				if (!e.target.files[0]) {
					setError('Пожалуйста, выберите файл')
					return
				}

				setLoading(true)
				setError(null)

				formData.append('excel_file', e.target.files[0])
				const response = await fetch('http://localhost:3000/api/upload-smeta', {
					method: 'POST',
					body: formData
				})

				const json: UploadResponse = await response.json()

				if (!response.ok) {
					throw new Error(json.error || 'Ошибка при загрузке файла')
				}

				if (json.data.object) {
					setObjectName(json.data.object)
				}

				addParsedWorks(json.data.places)
			}
		} catch (err: any) {
			setError(err.message || 'Произошла неизвестная ошибка')
		}
	}

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

			{/* Импорт таблицы */}
			<input
				type='file'
				accept='.xlsx, .xls'
				onChange={handleFileChange}
				className={`w-full py-3 rounded-xl border border-dashed text-sm cursor-pointer transition-colors ${
					isDark
						? 'border-neutral-700 text-neutral-400 hover:bg-neutral-900'
						: 'border-slate-300 text-slate-500 hover:bg-slate-50'
				}`}
			/>
		</div>
	)
}

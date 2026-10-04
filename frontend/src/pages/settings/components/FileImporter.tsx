import type { ChangeEvent, RefObject } from 'react'

interface FileImporterProps {
	fileInputRef: RefObject<HTMLInputElement | null>
	loading: boolean
	importedTable: string | null
	error: string | null
	onFileChange: (e: ChangeEvent<HTMLInputElement>) => void
	isDark: boolean
}

export function FileImporter({
	fileInputRef,
	loading,
	importedTable,
	error,
	onFileChange,
	isDark
}: FileImporterProps) {
	return (
		<div>
			<input
				ref={fileInputRef}
				type='file'
				accept='.xlsx, .xls'
				onChange={onFileChange}
				className='hidden'
			/>
			<button
				onClick={() => fileInputRef.current?.click()}
				disabled={loading}
				className={`w-full py-3 rounded-xl border border-dashed text-sm cursor-pointer transition-colors ${
					isDark
						? 'border-neutral-700 text-neutral-400 hover:bg-neutral-900'
						: 'border-slate-300 text-slate-500 hover:bg-slate-50'
				}`}
			>
				{loading
					? 'Загрузка...'
					: !importedTable
						? 'Импортировать таблицу'
						: `Загруженная таблица: ${importedTable}`}
			</button>
			{error && (
				<p
					role='alert'
					className='mt-2 text-sm text-red-500'
				>
					{error}
				</p>
			)}
		</div>
	)
}

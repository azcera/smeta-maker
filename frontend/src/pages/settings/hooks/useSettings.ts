import { useRef, useState, type ChangeEvent } from 'react'
import { useSmetaStore } from '../../../store/smetaStore'
import type { UploadResponse } from '../../../types'

const API_URL = import.meta.env.VITE_API_URL

export function useSettings() {
	const store = useSmetaStore()
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
		try {
			if (e.target.files && e.target.files.length > 0) {
				setLoading(true)
				const formData = new FormData()
				if (!e.target.files[0]) {
					setError('Пожалуйста, выберите файл')
					return
				}

				setError(null)
				formData.append('excel_file', e.target.files[0])

				const response = await fetch(`${API_URL}/upload-smeta`, {
					method: 'POST',
					body: formData
				})

				const json: UploadResponse = await response.json()

				if (!response.ok) {
					throw new Error(json.error || 'Ошибка при загрузке файла')
				}

				store.setImportedTable(e.target.files[0].name)

				if (json.data.object) store.setObjectName(json.data.object)
				if (json.data.transportCost) {
					store.setIsTransportCost(true)
					store.setTransportCost(json.data.transportCost)
				}
				if (json.data.trashCost) {
					store.setIsTrashCost(true)
					store.setTrashCost(json.data.trashCost)
				}
				if (Object.entries(json.data.places).length > 1) {
					store.setIsMultiplePlaces(true)
				}
				store.addParsedWorks(json.data.places)
			}
		} catch (err: any) {
			setError(err.message || 'Произошла неизвестная ошибка')
		} finally {
			setLoading(false)
		}
	}

	const handleCostChange = (
		e: ChangeEvent<HTMLInputElement>,
		setCost: (value: number) => void
	) => {
		let inputValue = e.target.value
		if (inputValue.length > 1 && inputValue.startsWith('0')) {
			inputValue = inputValue.replace(/^0+/, '')
		}
		if (inputValue === '00') return

		let numericValue = Number(inputValue)
		if (numericValue < 0) numericValue = 0

		if (inputValue === '' || isNaN(numericValue)) {
			setCost(0)
		} else {
			setCost(numericValue)
		}
	}

	return {
		error,
		setError,
		loading,
		fileInputRef,
		handleFileChange,
		handleCostChange,
		...store
	}
}

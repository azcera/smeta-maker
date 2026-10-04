import { useState } from 'react'
import slugify from 'slugify'
import { generateSmeta } from '../../../api/smetaApi'
import { useSmetaStore } from '../../../store/smetaStore'
import type { ModalMessageType } from '../../../types'

export function useSmetaExport(onError: (msg: ModalMessageType) => void) {
	const [saving, setSaving] = useState(false)
	const {
		objectName,
		places,
		isTransportCost,
		transportCost,
		isTrashCost,
		trashCost
	} = useSmetaStore()

	const handleSave = async () => {
		if (!objectName.trim()) {
			onError({
				title: 'Ошибка',
				description: 'Укажите название объекта в настройках'
			})
			return
		}

		const allWorksCount = places.reduce((sum, p) => sum + p.works.length, 0)
		if (allWorksCount === 0) {
			onError({ title: 'Ошибка', description: 'Добавьте хотя бы одну работу' })
			return
		}

		try {
			setSaving(true)

			const placesPayload: Record<string, any[]> = {}
			places.forEach(place => {
				if (place.works.length > 0) {
					placesPayload[place.name] = place.works.map(w => ({
						name: w.name,
						unit: w.unit,
						quantity: w.quantity,
						price: w.price
					}))
				}
			})

			const blob = await generateSmeta({
				object: objectName,
				places: placesPayload,
				transportCost:
					isTransportCost && transportCost !== 0 ? transportCost : undefined,
				trashCost: isTrashCost && trashCost !== 0 ? trashCost : undefined
			})

			const safeName = slugify(objectName, {
				lower: true,
				replacement: '_',
				locale: 'ru'
			}).substring(0, 40)
			const fileName = `smeta_${safeName || 'document'}.xlsx`
			const file = new File([blob], fileName, {
				type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
			})

			const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(
				navigator.userAgent
			)
			const canShare =
				isMobile &&
				typeof navigator.share === 'function' &&
				navigator.canShare?.({ files: [file] })

			if (canShare) {
				try {
					await navigator.share({ files: [file] })
					return
				} catch (shareErr: any) {
					if (shareErr.name === 'AbortError') return
				}
			}

			const url = URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = url
			a.download = fileName
			a.click()
			URL.revokeObjectURL(url)
		} catch (err: any) {
			onError({
				title: 'Ошибка',
				description: err.message || 'Ошибка при создании сметы'
			})
		} finally {
			setSaving(false)
		}
	}

	return { handleSave, saving }
}

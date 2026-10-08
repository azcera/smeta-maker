import { type RefObject, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'

interface UseSmartScrollProps {
	containerRef: RefObject<HTMLDivElement | null>
	itemsCount: number
	enabled: boolean
}

export const useSmartScrollToBottom = ({
	containerRef,
	itemsCount,
	enabled
}: UseSmartScrollProps) => {
	const prevCountRef = useRef(itemsCount)
	const [searchParams, setSearchParams] = useSearchParams()
	const didScrollRef = useRef(false)

	useEffect(() => {
		if (!enabled || didScrollRef.current) return

		const container = containerRef.current
		if (!container) return

		const prev = prevCountRef.current
		prevCountRef.current = itemsCount

		// Скроллим если:
		// 1. Пришли с ?scroll=true (enabled)
		// 2. Или реально добавили элемент пока были на странице
		const shouldScroll = enabled || itemsCount > prev
		if (!shouldScroll) return

		const scrollToBottom = () => {
			const hasScrollableContent =
				container.scrollHeight > container.clientHeight + 8
			if (!hasScrollableContent) return

			container.scrollTo({
				top: container.scrollHeight,
				behavior: 'auto'
			})
		}

		// Ждём, пока React дорисует + layout
		const id = requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				scrollToBottom()

				// На всякий случай ещё раз чуть позже (на случай медленного рендера PlaceList)
				setTimeout(() => {
					scrollToBottom()
					didScrollRef.current = true

					// Убираем ?scroll=true, чтобы при следующих ререндерах не дёргало
					if (searchParams.get('scroll') === 'true') {
						searchParams.delete('scroll')
						setSearchParams(searchParams, { replace: true })
					}
				}, 50)
			})
		})

		return () => cancelAnimationFrame(id)
	}, [containerRef, itemsCount, enabled, searchParams, setSearchParams])
}

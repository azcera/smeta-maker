import { type RefObject, useEffect, useRef } from 'react'

interface UseSmartScrollProps {
	containerRef: RefObject<HTMLDivElement | null>
	itemsCount: number
}

export const useSmartScrollToBottom = ({
	containerRef,
	itemsCount
}: UseSmartScrollProps) => {
	const prevCountRef = useRef(itemsCount)

	useEffect(() => {
		const container = containerRef.current
		if (!container) return

		const prev = prevCountRef.current
		prevCountRef.current = itemsCount

		// скроллим только если элементов стало БОЛЬШЕ (добавили)
		if (itemsCount <= prev) return

		const hasScrollableContent =
			container.scrollHeight > container.clientHeight + 8
		if (!hasScrollableContent) return

		// двойной rAF — после layout
		const id1 = requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				container.scrollTo({
					top: container.scrollHeight,
					// на iOS smooth часто дёргается — можно 'auto'
					behavior: 'smooth'
				})
			})
		})

		return () => cancelAnimationFrame(id1)
	}, [containerRef, itemsCount])
}

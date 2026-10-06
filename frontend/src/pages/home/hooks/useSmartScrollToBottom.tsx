import { type RefObject, useEffect, useRef } from 'react'

interface UseSmartScrollProps {
	containerRef: RefObject<HTMLDivElement | null>
	triggerDeps: any // totalElementsCount из HomePage
}

export const useSmartScrollToBottom = ({
	containerRef,
	triggerDeps
}: UseSmartScrollProps) => {
	const prevDepsRef = useRef(triggerDeps)

	useEffect(() => {
		const container = containerRef.current
		if (!container) return

		const performScroll = () => {
			// Проверяем, превышает ли реальный контент высоту видимого контейнера
			const hasScrollableContent =
				container.scrollHeight > container.clientHeight

			if (hasScrollableContent) {
				container.scrollTo({
					top: container.scrollHeight,
					behavior: 'smooth'
				})
			}
		}

		// Двойной requestAnimationFrame гарантирует, что React успел вставить
		// все элементы в DOM и браузер завершил их отрисовку (Layout/Paint)
		let frameId1: number
		let frameId2: number

		frameId1 = requestAnimationFrame(() => {
			frameId2 = requestAnimationFrame(() => {
				performScroll()
			})
		})

		// Запоминаем текущее значение для отслеживания именно добавления новых данных
		prevDepsRef.current = triggerDeps

		return () => {
			cancelAnimationFrame(frameId1)
			if (frameId2) cancelAnimationFrame(frameId2)
		}
		// Добавляем пустой массив в зависимости? Нет, нам нужно следить и за изменением данных,
		// и отрабатывать при монтировании (возврат с другой страницы)
	}, [containerRef, triggerDeps])
}

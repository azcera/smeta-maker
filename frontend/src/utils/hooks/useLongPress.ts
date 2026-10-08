import React, { useCallback, useRef } from 'react'

type PressEventHandler = (e: React.MouseEvent | React.TouchEvent) => void

// Кастомный хук с типами
export function useLongPress(callback: PressEventHandler, ms: number = 500) {
	// В браузере setTimeout возвращает number, типизируем через NodeJS.Timeout или number
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	const start = useCallback(
		(e: React.MouseEvent | React.TouchEvent) => {
			// Отключаем вызов контекстного меню на iOS при таче
			if (e.target instanceof HTMLElement) {
				e.target.style.setProperty('-webkit-touch-callout', 'none')
			}

			// Запускаем таймер
			timerRef.current = setTimeout(() => {
				callback(e)
			}, ms)
		},
		[callback, ms]
	)

	const stop = useCallback(() => {
		if (timerRef.current) {
			clearTimeout(timerRef.current)
			timerRef.current = null
		}
	}, [])

	// Возвращаем строго типизированный объект с обработчиками событий
	return {
		onMouseDown: start,
		onMouseUp: stop,
		onMouseLeave: stop,
		onTouchStart: start,
		onTouchEnd: stop
	}
}

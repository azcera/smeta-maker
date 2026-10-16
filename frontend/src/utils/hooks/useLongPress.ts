import React, { useCallback, useRef } from 'react'

type PressEventHandler = (e: React.MouseEvent | React.TouchEvent) => void

export function useLongPress(
	callback: PressEventHandler,
	ms: number = 800,
	moveThreshold = 10
) {
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const startPositionRef = useRef<{ x: number; y: number } | null>(null)
	const triggeredRef = useRef(false)

	const stop = useCallback(() => {
		if (timerRef.current !== null) {
			clearTimeout(timerRef.current)
			timerRef.current = null
		}
	}, [])

	const start = useCallback(
		(e: React.MouseEvent | React.TouchEvent) => {
			stop()

			const point = 'touches' in e ? e.touches[0] : e

			if (!point) return

			startPositionRef.current = {
				x: point.clientX,
				y: point.clientY
			}
			triggeredRef.current = false

			timerRef.current = setTimeout(() => {
				triggeredRef.current = true
				callback(e)
				timerRef.current = null
			}, ms)
		},
		[callback, ms, stop]
	)

	const move = useCallback(
		(e: React.TouchEvent | React.MouseEvent) => {
			const startPosition = startPositionRef.current
			if (!startPosition) return

			const point = 'touches' in e ? e.touches[0] : e

			if (!point) return

			const dx = point.clientX - startPosition.x
			const dy = point.clientY - startPosition.y

			if (Math.hypot(dx, dy) > moveThreshold) {
				stop()
				startPositionRef.current = null
			}
		},
		[moveThreshold, stop]
	)

	const end = useCallback(() => {
		stop()
		startPositionRef.current = null
	}, [stop])

	return {
		onMouseDown: start,
		onMouseMove: move,
		onMouseUp: end,
		onMouseLeave: end,
		onTouchStart: start,
		onTouchMove: move,
		onTouchEnd: end,
		onTouchCancel: end
	}
}

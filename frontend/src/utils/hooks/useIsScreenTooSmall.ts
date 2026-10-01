import { useEffect, useState } from 'react'

export function useIsScreenTooSmall(breakpointWidth: number): boolean {
	const [isTooSmall, setIsTooSmall] = useState(false)

	useEffect(() => {
		const mediaQuery = window.matchMedia(
			`(max-width: ${breakpointWidth - 1}px)`
		)

		setIsTooSmall(mediaQuery.matches)

		const handleChange = (e: MediaQueryListEvent) => {
			setIsTooSmall(e.matches)
		}

		mediaQuery.addEventListener('change', handleChange)

		return () => mediaQuery.removeEventListener('change', handleChange)
	}, [breakpointWidth])

	return isTooSmall
}

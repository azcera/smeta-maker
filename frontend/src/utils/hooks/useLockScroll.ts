import { useEffect } from 'react'

export const useLockScroll = (isActive: boolean) => {
	useEffect(() => {
		if (!isActive) return

		// Сразу скроллим в самый верх при активации
		window.scrollTo(0, 0)

		const handleScroll = () => {
			if (window.scrollY !== 0) {
				window.scrollTo(0, 0)
			}
		}

		// Слушаем скролл на всем окне
		window.addEventListener('scroll', handleScroll, { passive: true })

		return () => {
			window.removeEventListener('scroll', handleScroll)
		}
	}, [isActive])
}

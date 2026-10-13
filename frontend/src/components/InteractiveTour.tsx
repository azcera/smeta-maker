import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useSmetaStore } from '../store/smetaStore'

/** Какой pathname нужен для шага (index) */
const STEP_PATH: Record<number, string | RegExp> = {
	0: '/',
	1: '/',
	2: '/',
	3: '/',
	4: /^\/works/, // категории
	5: /^\/works/, // работы
	6: /^\/works/, // редактирование
	7: /^\/works/, // сохранить работу
	8: '/',
	9: '/',
	10: '/',
	11: '/',
	12: '/',
	13: '/',
	14: '/',
	15: '/',
	16: '/'
}

function pathMatches(stepIndex: number, pathname: string) {
	const rule = STEP_PATH[stepIndex]
	if (rule == null) return true
	if (typeof rule === 'string') return pathname === rule
	return rule.test(pathname)
}

export function skipTour() {
	const { setIsTourCompleted, setTourStep, setShowTour } =
		useSmetaStore.getState()
	setIsTourCompleted(true)
	setTourStep(null)
	setShowTour(false)
	document.body.classList.remove('tour-allow-all-clicks')
	window.dispatchEvent(new Event('tour:skip'))
}

export function playTour(navigate?: (path: string) => void) {
	const { setIsTourCompleted, setTourStep, setShowTour } =
		useSmetaStore.getState()
	setIsTourCompleted(false)
	setShowTour(true)
	setTourStep(0)

	if (navigate) {
		navigate('/')
	}
}

export function InteractiveTour() {
	const location = useLocation()
	const driverRef = useRef<ReturnType<typeof driver> | null>(null)
	const isNavigatingRef = useRef(false)

	useEffect(() => {
		const onSkip = () => {
			isNavigatingRef.current = false
			driverRef.current?.destroy()
			driverRef.current = null
		}
		window.addEventListener('tour:skip', onSkip)
		return () => window.removeEventListener('tour:skip', onSkip)
	}, [])

	useEffect(() => {
		const {
			isDark,
			showTour,
			isTourCompleted,
			tourStep,
			setTourStep,
			setIsTourCompleted,
			setShowTour,
			places
		} = useSmetaStore.getState()

		if (isTourCompleted || !showTour) return
		const startIndex = tourStep !== null ? Number(tourStep) : 0

		// ЗАЩИТА ОТ ОБНОВЛЕНИЯ СТРАНИЦЫ (F5)
		const isWorksPage = /^\/works/.test(location.pathname)
		const hasPlaces =
			places && (Array.isArray(places) ? places.length > 0 : true)

		let correctedIndex = startIndex

		if (isWorksPage && startIndex >= 4 && startIndex <= 7) {
			const categoriesEl = document.querySelector('#categoriesToSelect')
			const worksEl = document.querySelector('#worksToSelect')
			const editEl = document.querySelector('#editingPage')

			if (!hasPlaces) {
				setTourStep(4)
				return
			}

			if (startIndex === 4 && !categoriesEl) {
				return
			}
			if (startIndex === 5 && !worksEl && categoriesEl) {
				setTourStep(4)
				return
			}
			if (startIndex === 6 && !editEl) {
				setTourStep(4)
				return
			}
		}

		if (!pathMatches(correctedIndex, location.pathname)) {
			document.body.classList.remove('tour-allow-all-clicks')
			return
		}

		if (driverRef.current && isNavigatingRef.current) {
			driverRef.current.destroy()
			driverRef.current = null
			isNavigatingRef.current = false
		}

		if (!driverRef.current) {
			driverRef.current = driver({
				showProgress: true,
				animate: true,
				allowClose: false,
				overlayClickBehavior: 'none',
				disableActiveInteraction: false,
				stagePadding: 6,
				nextBtnText: 'Далее →',
				prevBtnText: '← Назад',
				doneBtnText: 'Готово!',
				overlayOpacity: 0.6,
				popoverClass: isDark
					? 'smeta-tour-popover smeta-tour-popover--dark'
					: 'smeta-tour-popover',

				steps: [
					// 0. Добавить помещение
					{
						element: '#addPlaceButton',
						popover: {
							title: 'Создай первое помещение',
							description: 'Нажми на эту кнопку',
							side: 'bottom',
							showButtons: []
						},
						onHighlighted: (el, _, { driver }) => {
							setTourStep(0)
							useSmetaStore.getState().clearAll()
							el?.addEventListener(
								'click',
								() => setTimeout(() => driver.moveNext(), 300),
								{ once: true }
							)
						}
					},
					// 1. Инпут в модалке (эффект печати)
					{
						element: '#placeModalInput',
						waitForElement: 5000,
						popover: {
							title: 'Название помещения',
							description:
								'Сейчас я автоматически заполню название. Потом просто нажми «Добавить».',
							side: 'right',
							showButtons: []
						},
						onHighlighted: (element, _, { driver }) => {
							setTourStep(1)
							const input = element as HTMLInputElement
							if (!input) return

							const textToInsert = 'Первое помещение'
							const delayPerChar = 80

							const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
								window.HTMLInputElement.prototype,
								'value'
							)?.set

							nativeInputValueSetter?.call(input, '')
							input.dispatchEvent(new Event('input', { bubbles: true }))

							textToInsert.split('').forEach((char, i) => {
								setTimeout(
									() => {
										// Проверяем, что тур не закрыт во время печати
										if (!driverRef.current) return
										nativeInputValueSetter?.call(input, input.value + char)
										input.dispatchEvent(new Event('input', { bubbles: true }))
									},
									delayPerChar * (i + 1)
								)
							})

							const totalTime = delayPerChar * textToInsert.length + 1500
							setTimeout(() => {
								if (driverRef.current) driver.moveNext()
							}, totalTime)
						}
					},
					// 2. Сохранить помещение
					{
						element: '#bluePlaceModalButton',
						waitForElement: 3000,
						popover: {
							title: 'Сохрани помещение',
							description: 'Нажми «Добавить»',
							side: 'bottom',
							showButtons: []
						},
						onHighlighted: (el, _, { driver }) => {
							setTourStep(2)
							el?.addEventListener(
								'click',
								() => setTimeout(() => driver.moveNext(), 300),
								{ once: true }
							)
						}
					},
					// 3. Добавить работу
					{
						element: '#addWorkButton',
						waitForElement: 4000,
						popover: {
							title: 'Теперь добавь работу',
							description: 'Нажми для перехода к категориям',
							side: 'bottom',
							showButtons: []
						},
						onHighlighted: (el, _, { driver }) => {
							setTourStep(3)
							el?.addEventListener(
								'click',
								() => {
									isNavigatingRef.current = true
									setTourStep(4)
									driver.destroy()
								},
								{ once: true }
							)
						}
					},
					// 4. Категории
					{
						element: '#categoriesToSelect',
						waitForElement: 5000,
						popover: {
							title: 'Выбери категорию',
							description:
								'Нажми на любую категорию, чтобы открыть список работ',
							side: 'top',
							showButtons: []
						},
						onHighlightStarted: () => {
							document.body.classList.add('tour-allow-all-clicks')
							useSmetaStore.getState().loadDbWorks()
						},
						onHighlighted: (_e, _, { driver }) => {
							setTourStep(4)
							// Ищем родителя или вешаем на body для надежности перехвата клика
							const root =
								document.querySelector('#categoriesToSelect')?.parentElement ??
								document.body

							const handler = (e: Event) => {
								const target = e.target as HTMLElement
								// Проверяем все возможные варианты ваших классов и дата-атрибутов
								if (
									target.closest(
										'[data-category], .category-item, #categoriesToSelect'
									)
								) {
									root.removeEventListener('click', handler, true)
									setTimeout(() => {
										if (driverRef.current) driver.moveNext()
									}, 400)
								}
							}
							root.addEventListener('click', handler, true)
						},
						onDeselected: () =>
							document.body.classList.remove('tour-allow-all-clicks')
					},
					// 5. Работы
					{
						element: '#worksToSelect',
						waitForElement: 5000,
						popover: {
							title: 'Выбери работу',
							description: 'Нажми на работу, чтобы добавить её в смету',
							side: 'top',
							showButtons: []
						},
						onHighlightStarted: () =>
							document.body.classList.add('tour-allow-all-clicks'),
						onHighlighted: (_e, _, { driver }) => {
							setTourStep(5)
							const root =
								document.querySelector('#worksToSelect')?.parentElement ??
								document.body

							const handler = (e: Event) => {
								const target = e.target as HTMLElement
								if (
									target.closest('[data-work], .works-item, #worksToSelect')
								) {
									root.removeEventListener('click', handler, true)
									setTimeout(() => {
										if (driverRef.current) driver.moveNext()
									}, 400)
								}
							}
							root.addEventListener('click', handler, true)
						},
						onDeselected: () =>
							document.body.classList.remove('tour-allow-all-clicks')
					},
					// 6. Редактирование
					{
						element: '#editingPage',
						waitForElement: 5000,
						popover: {
							title: 'Измени значения',
							description: 'Введи количество для продолжения',
							side: 'bottom',
							showButtons: []
						},
						onHighlightStarted: () =>
							document.body.classList.add('tour-allow-all-clicks'),
						onHighlighted: (_, __, { driver }) => {
							setTourStep(6)
							const input = document.getElementById('countInput')
							input?.focus()
							input?.addEventListener(
								'input',
								() => {
									document.body.classList.remove('tour-allow-all-clicks')
									setTimeout(() => driver.moveNext(), 300)
								},
								{ once: true }
							)
						},
						onDeselected: () =>
							document.body.classList.remove('tour-allow-all-clicks')
					},
					// 7. Сохранить работу
					{
						element: '#addWorkButton',
						waitForElement: 5000,
						popover: {
							title: 'Сохрани добавленную работу',
							description: 'Нажми на кнопку',
							side: 'bottom',
							showButtons: []
						},
						onHighlighted: (el, _, { driver }) => {
							setTourStep(7)
							el?.addEventListener(
								'click',
								() => {
									const currentPlaces = useSmetaStore.getState().places
									const targetPlace = Array.isArray(currentPlaces)
										? currentPlaces[0]
										: currentPlaces
									if (targetPlace) {
										useSmetaStore.getState().addWork(targetPlace.id, {
											name: 'Сборка мебели',
											price: 5000,
											quantity: 1,
											unit: 'комплекс',
											fromDb: false
										})
									}
									isNavigatingRef.current = true
									setTourStep(8)
									driver.destroy()
								},
								{ once: true }
							)
						}
					},
					// 8. Вторая работа на главной
					{
						element: '#secondWorkItem',
						waitForElement: 5000,
						popover: {
							title: 'Ваша работа',
							description: 'Появилась в смете',
							side: 'bottom',
							showButtons: ['next']
						},
						onHighlighted: (el, _, { driver }) => {
							setTourStep(8)
							el?.addEventListener('click', () => driver.moveNext(), {
								once: true
							})
						}
					},
					// 9. Первая работа
					{
						element: '#firstWorkItem',
						waitForElement: 5000,
						popover: {
							title: 'Пример работы',
							description: 'Появилась для демонстрации',
							side: 'bottom',
							showButtons: ['next']
						},
						onHighlighted: (el, _, { driver }) => {
							setTourStep(9)
							el?.addEventListener('click', () => driver.moveNext(), {
								once: true
							})
						}
					},
					// 10. Long-press
					{
						element: '#firstWorkItem',
						popover: {
							title: 'Зажмите эту работу',
							description: 'Для изменения порядка',
							side: 'bottom',
							showButtons: []
						},
						onHighlightStarted: () =>
							document.body.classList.add('tour-allow-all-clicks'),
						onHighlighted: (el, _, { driver }) => {
							setTourStep(10)
							const observer = new MutationObserver(() => {
								if (
									document.querySelector('.animate-wiggle') ||
									el?.classList.contains('animate-wiggle')
								) {
									observer.disconnect()
									setTimeout(() => driver.moveNext(), 300)
								}
							})
							observer.observe(document.body, {
								childList: true,
								subtree: true,
								attributes: true
							})
						},
						onDeselected: () =>
							document.body.classList.remove('tour-allow-all-clicks')
					},
					// 11. Drag & drop
					{
						element: '#reorderIcon',
						popover: {
							title: 'Потяни за кнопку',
							description: 'Перетащи работу',
							side: 'bottom',
							showButtons: []
						},
						onHighlightStarted: () =>
							document.body.classList.add('tour-allow-all-clicks'),
						onHighlighted: (_, __, { driver }) => {
							setTourStep(11)
							const currentPlaces = useSmetaStore.getState().places
							const targetPlace = Array.isArray(currentPlaces)
								? currentPlaces[0]
								: currentPlaces
							const initialOrder =
								targetPlace?.works?.map((w: any) => w.id).join(',') ?? ''

							const unsubscribe = useSmetaStore.subscribe(state => {
								const statePlaces = state.places
								const statePlace = Array.isArray(statePlaces)
									? statePlaces[0]
									: statePlaces
								const currentOrder =
									statePlace?.works?.map((w: any) => w.id).join(',') ?? ''
								if (currentOrder && currentOrder !== initialOrder) {
									unsubscribe()
									setTimeout(() => driver.moveNext(), 300)
								}
							})
						},
						onDeselected: () =>
							document.body.classList.remove('tour-allow-all-clicks')
					},
					// 12. Сохранить порядок
					{
						element: '#saveReorder',
						waitForElement: 3000,
						popover: {
							title: 'Нажми на кнопку',
							description: 'Сохрани изменения',
							side: 'bottom',
							showButtons: []
						},
						onHighlighted: (el, _, { driver }) => {
							setTourStep(12)
							el?.addEventListener('click', () => driver.moveNext(), {
								once: true
							})
						}
					},
					// 13. Результат
					{
						element: '#homePage',
						popover: {
							title: 'Результат',
							description: 'Вы научились управлять элементами',
							side: 'bottom',
							showButtons: ['next']
						},

						onHighlighted: () => setTourStep(13),
						onHighlightStarted: () =>
							document.body.classList.add('tour-allow-all-clicks'),
						onDeselected: () =>
							document.body.classList.remove('tour-allow-all-clicks')
					},
					// 14. Удалить всё
					{
						element: '#deleteAllButton',
						popover: {
							title: 'Удаление всего',
							description: 'Очистите данные перед работой',
							side: 'bottom',
							showButtons: []
						},
						onHighlighted: (el, _, { driver }) => {
							setTourStep(14)
							el?.addEventListener('click', () => driver.moveNext(), {
								once: true
							})
						}
					},
					// 15. Подтверждение
					{
						element: '#blueModalButton',
						waitForElement: 5000,
						popover: {
							title: 'Подтверди выбор',
							description: 'Данные удалятся',
							side: 'bottom',
							showButtons: []
						},
						onHighlighted: (el, _, { driver }) => {
							setTourStep(15)
							el?.addEventListener('click', () => driver.moveNext(), {
								once: true
							})
						}
					},
					// 16. Конец
					{
						element: '#endOfTour',
						popover: {
							title: 'Обучение окончено!',
							description: 'Можно создавать свои сметы.',
							side: 'bottom',
							showButtons: ['next'],
							doneBtnText: 'Готово!',
							onNextClick: (_, __, { driver }) => {
								setIsTourCompleted(true)
								setTourStep(null)
								setShowTour(false)
								driver.destroy()
							}
						}
					}
				],

				onDestroyed: () => {
					document.body.classList.remove('tour-allow-all-clicks')
					if (isNavigatingRef.current) return
					setIsTourCompleted(true)
					setTourStep(null)
				}
			})
		}

		const timer = setTimeout(() => {
			if (driverRef.current) {
				driverRef.current.drive(correctedIndex)
			}
		}, 300)

		return () => {
			clearTimeout(timer)
		}
	}, [location.pathname])

	return null
}

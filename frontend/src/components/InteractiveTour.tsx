import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useSmetaStore } from '../store/smetaStore'

const TOUR_COMPLETED_KEY = 'hasSeenInteractiveTour'
const TOUR_STEP_KEY = 'onboarding-step'

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
	8: '/', // secondWorkItem
	9: '/', // firstWorkItem
	10: '/', // long-press
	11: '/', // reorder
	12: '/', // save reorder
	13: '/', // homePage
	14: '/', // deleteAll
	15: '/', // blueModal
	16: '/' // end
}

function pathMatches(stepIndex: number, pathname: string) {
	const rule = STEP_PATH[stepIndex]
	if (rule == null) return true
	if (typeof rule === 'string') return pathname === rule
	return rule.test(pathname)
}

/** Вызвать из UI: «Пропустить обучение» */
export function skipTour() {
	localStorage.setItem(TOUR_COMPLETED_KEY, 'true')
	localStorage.removeItem(TOUR_STEP_KEY)
	document.body.classList.remove('tour-allow-all-clicks')
	window.dispatchEvent(new Event('tour:skip'))
}

export function InteractiveTour() {
	const location = useLocation()
	const driverRef = useRef<ReturnType<typeof driver> | null>(null)
	const isNavigatingRef = useRef(false)

	// Кнопка «Пропустить»
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
		if (localStorage.getItem(TOUR_COMPLETED_KEY) === 'true') return

		const { isDark } = useSmetaStore.getState()
		const savedStep = localStorage.getItem(TOUR_STEP_KEY)
		const isStartPage = location.pathname === '/'

		// Тур ещё не начат и мы не на старте
		if (savedStep === null && !isStartPage) return

		const startIndex = savedStep !== null ? Number(savedStep) : 0

		// Страница не подходит под текущий шаг — не вешаем overlay
		if (!pathMatches(startIndex, location.pathname)) {
			document.body.classList.remove('tour-allow-all-clicks')
			return
		}

		if (driverRef.current) {
			isNavigatingRef.current = true
			driverRef.current.destroy()
			driverRef.current = null
		}

		const driverObj = driver({
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
				// 0. Кнопка добавить помещение
				{
					element: '#addPlaceButton',
					popover: {
						title: 'Создай первое помещение',
						description: 'Нажми на эту кнопку, чтобы создать новое помещение',
						side: 'bottom',
						showButtons: []
					},
					onHighlighted: (element, _, { driver, index }) => {
						if (typeof index === 'number') {
							localStorage.setItem(TOUR_STEP_KEY, String(index))
						}

						const { clearAll } = useSmetaStore.getState()
						clearAll()

						const btn = element as HTMLElement
						if (!btn) return

						btn.addEventListener(
							'click',
							() => setTimeout(() => driver.moveNext(), 400),
							{ once: true }
						)
					}
				},

				// 1. Инпут в модалке
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
					onHighlighted: (element, _, { driver, index }) => {
						if (typeof index === 'number') {
							localStorage.setItem(TOUR_STEP_KEY, String(index))
						}

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
									nativeInputValueSetter?.call(input, input.value + char)
									input.dispatchEvent(new Event('input', { bubbles: true }))
								},
								delayPerChar * (i + 1)
							)
						})

						const totalTime = delayPerChar * textToInsert.length + 1500
						setTimeout(() => driver.moveNext(), totalTime)
					}
				},

				// 2. Сохранить помещение
				{
					element: '#bluePlaceModalButton',
					waitForElement: 3000,
					popover: {
						title: 'Сохрани помещение',
						description: 'Нажми «Добавить», чтобы создать помещение',
						side: 'bottom',
						showButtons: []
					},
					onHighlighted: (element, _, { driver, index }) => {
						if (typeof index === 'number') {
							localStorage.setItem(TOUR_STEP_KEY, String(index))
						}

						const btn = element as HTMLElement
						if (!btn) return

						btn.addEventListener(
							'click',
							() => setTimeout(() => driver.moveNext(), 400),
							{ once: true }
						)
					}
				},

				// 3. Добавить работу → уход на /works/...
				{
					element: '#addWorkButton',
					waitForElement: 4000,
					popover: {
						title: 'Теперь добавь работу',
						description: 'Нажми, чтобы открыть список категорий с работами',
						side: 'bottom',
						showButtons: []
					},
					onHighlighted: (element, _, { driver }) => {
						const btn = element as HTMLElement
						if (!btn) return

						btn.addEventListener(
							'click',
							() => {
								localStorage.setItem(TOUR_STEP_KEY, '4')
								isNavigatingRef.current = true
								driver.destroy()
							},
							{ once: true }
						)
					}
				},

				// 4. Категории
				{
					element: '#categoriesToSelect',
					waitForElement: 10000,
					skipMissingElement: true,
					popover: {
						title: 'Выбери категорию',
						description: 'Нажми на любую категорию, чтобы открыть список работ',
						side: 'top',
						showButtons: []
					},
					onHighlightStarted: () => {
						document.body.classList.add('tour-allow-all-clicks')
					},
					onHighlighted: (_e, _, { driver, index }) => {
						if (typeof index === 'number') {
							localStorage.setItem(TOUR_STEP_KEY, String(index))
						}

						const root =
							document.querySelector('#categoriesToSelect')?.parentElement ??
							document.body

						const handler = (e: Event) => {
							const target = e.target as HTMLElement
							if (
								target.closest(
									'[data-category], .category-item, #categoriesToSelect'
								)
							) {
								root.removeEventListener('click', handler, true)
								setTimeout(() => driver.moveNext(), 400)
							}
						}

						root.addEventListener('click', handler, true)
					},
					onDeselected: () => {
						document.body.classList.remove('tour-allow-all-clicks')
					}
				},

				// 5. Работы
				{
					element: '#worksToSelect',
					waitForElement: 10000,
					skipMissingElement: true,
					popover: {
						title: 'Выбери работу',
						description: 'Нажми на работу, чтобы добавить её в смету',
						side: 'top',
						showButtons: []
					},
					onHighlightStarted: () => {
						document.body.classList.add('tour-allow-all-clicks')
					},
					onHighlighted: (_e, _, { driver, index }) => {
						if (typeof index === 'number') {
							localStorage.setItem(TOUR_STEP_KEY, String(index))
						}

						const root =
							document.querySelector('#worksToSelect')?.parentElement ??
							document.body

						const handler = (e: Event) => {
							const target = e.target as HTMLElement
							if (target.closest('[data-work], .works-item, #worksToSelect')) {
								root.removeEventListener('click', handler, true)
								setTimeout(() => driver.moveNext(), 400)
							}
						}

						root.addEventListener('click', handler, true)
					},
					onDeselected: () => {
						document.body.classList.remove('tour-allow-all-clicks')
					}
				},

				// 6. Редактирование
				{
					element: '#editingPage',
					waitForElement: 5000,
					popover: {
						title: 'Измени значения',
						description:
							'Меняй цену, единицу, количество и название. Для продолжения введи любое количество.',
						side: 'bottom',
						showButtons: []
					},
					onHighlightStarted: () => {
						document.body.classList.add('tour-allow-all-clicks')
					},
					onHighlighted: (_e, _, { driver, index }) => {
						if (typeof index === 'number') {
							localStorage.setItem(TOUR_STEP_KEY, String(index))
						}

						const input = document.getElementById('countInput')
						if (!input) return

						input.focus()
						input.addEventListener(
							'input',
							() => {
								document.body.classList.remove('tour-allow-all-clicks')
								setTimeout(() => driver.moveNext(), 400)
							},
							{ once: true }
						)
					},
					onDeselected: () => {
						document.body.classList.remove('tour-allow-all-clicks')
					}
				},

				// 7. Сохранить работу → назад на главную
				{
					element: '#addWorkButton',
					waitForElement: 5000,
					popover: {
						title: 'Сохрани добавленную работу',
						description: 'Нажми на кнопку — работа попадёт в смету',
						side: 'bottom',
						showButtons: []
					},
					onHighlighted: (element, _, { driver }) => {
						const btn = element as HTMLElement
						if (!btn) return

						btn.addEventListener(
							'click',
							() => {
								const { places, addWork } = useSmetaStore.getState()

								if (places[0]) {
									addWork(places[0].id, {
										name: 'Сборка мебели',
										price: 5000,
										quantity: 1,
										unit: 'комплекс',
										fromDb: false
									})
								}

								localStorage.setItem(TOUR_STEP_KEY, '8')
								isNavigatingRef.current = true
								driver.destroy()
							},
							{ once: true }
						)
					}
				},

				// 8. Вторая работа на главной
				{
					element: '#secondWorkItem',
					waitForElement: 8000,
					skipMissingElement: true,
					popover: {
						title: 'Ваша первая добавленная работа',
						description: 'Вот она появилась в смете',
						side: 'bottom',
						showButtons: ['next']
					},
					onHighlighted: (element, _, { driver, index }) => {
						if (typeof index === 'number') {
							localStorage.setItem(TOUR_STEP_KEY, String(index))
						}

						const btn = element as HTMLElement
						if (!btn) return

						btn.addEventListener(
							'click',
							() => setTimeout(() => driver.moveNext(), 300),
							{ once: true }
						)
					}
				},

				// 9. Первая работа (пример)
				{
					element: '#firstWorkItem',
					waitForElement: 5000,
					skipMissingElement: true,
					popover: {
						title: 'Ещё одна работа',
						description: 'Она появилась для примера, чтобы показать функционал',
						side: 'bottom',
						showButtons: ['next']
					},
					onHighlighted: (element, _, { driver, index }) => {
						if (typeof index === 'number') {
							localStorage.setItem(TOUR_STEP_KEY, String(index))
						}

						const btn = element as HTMLElement
						if (!btn) return

						btn.addEventListener(
							'click',
							() => setTimeout(() => driver.moveNext(), 300),
							{ once: true }
						)
					}
				},

				// 10. Long-press
				{
					element: '#firstWorkItem',
					popover: {
						title: 'Зажмите эту работу',
						description: 'Так вы перейдёте в режим изменения порядка работ',
						side: 'bottom',
						showButtons: []
					},
					onHighlightStarted: () => {
						document.body.classList.add('tour-allow-all-clicks')
					},
					onHighlighted: (element, _, { driver, index }) => {
						if (typeof index === 'number') {
							localStorage.setItem(TOUR_STEP_KEY, String(index))
						}

						const el = element as HTMLElement
						if (!el) return

						const tryNext = () => {
							if (
								document.querySelector('.animate-wiggle') ||
								el.classList.contains('animate-wiggle')
							) {
								setTimeout(() => driver.moveNext(), 300)
								return true
							}
							return false
						}

						if (tryNext()) return

						const observer = new MutationObserver(() => {
							if (tryNext()) observer.disconnect()
						})

						observer.observe(document.body, {
							childList: true,
							subtree: true,
							attributes: true,
							attributeFilter: ['class']
						})

						setTimeout(() => observer.disconnect(), 15000)
					},
					onDeselected: () => {
						document.body.classList.remove('tour-allow-all-clicks')
					}
				},

				// 11. Drag & drop
				{
					element: '#reorderIcon',
					popover: {
						title: 'Потяни за кнопку',
						description: 'Перетащи работу и поменяй местами',
						side: 'bottom',
						showButtons: []
					},
					onHighlightStarted: () => {
						document.body.classList.add('tour-allow-all-clicks')
					},
					onHighlighted: (_e, _, { driver, index }) => {
						if (typeof index === 'number') {
							localStorage.setItem(TOUR_STEP_KEY, String(index))
						}

						const getOrder = () =>
							useSmetaStore
								.getState()
								.places[0]?.works.map(w => w.id)
								.join(',') ?? ''

						const initialOrder = getOrder()

						const unsubscribe = useSmetaStore.subscribe(state => {
							const currentOrder =
								state.places[0]?.works.map(w => w.id).join(',') ?? ''

							if (currentOrder && currentOrder !== initialOrder) {
								unsubscribe()
								document.body.classList.remove('tour-allow-all-clicks')
								setTimeout(() => driver.moveNext(), 300)
							}
						})

						setTimeout(() => unsubscribe(), 20000)
					},
					onDeselected: () => {
						document.body.classList.remove('tour-allow-all-clicks')
					}
				},

				// 12. Сохранить порядок
				{
					element: '#saveReorder',
					waitForElement: 3000,
					popover: {
						title: 'Нажми на кнопку',
						description:
							'Сохрани изменения. Можно также тапнуть в пустое место',
						side: 'bottom',
						showButtons: []
					},
					onHighlighted: (element, _, { driver, index }) => {
						if (typeof index === 'number') {
							localStorage.setItem(TOUR_STEP_KEY, String(index))
						}

						const btn = element as HTMLElement
						if (!btn) return

						btn.addEventListener(
							'click',
							() => setTimeout(() => driver.moveNext(), 300),
							{ once: true }
						)
					}
				},

				// 13. Результат
				{
					element: '#homePage',
					popover: {
						title: 'Посмотри на результат',
						description: 'Ты научился добавлять элементы и менять их местами',
						side: 'bottom',
						showButtons: ['next']
					},
					onHighlightStarted: () => {
						document.body.classList.add('tour-allow-all-clicks')
					},
					onHighlighted: (_e, _s, { index }) => {
						if (typeof index === 'number') {
							localStorage.setItem(TOUR_STEP_KEY, String(index))
						}
					},
					onDeselected: () => {
						document.body.classList.remove('tour-allow-all-clicks')
					}
				},

				// 14. Удалить всё
				{
					element: '#deleteAllButton',
					popover: {
						title: 'Кнопка удаления всего',
						description: 'Удали все ненужные данные перед началом работы',
						side: 'bottom',
						showButtons: []
					},
					onHighlighted: (element, _, { driver, index }) => {
						if (typeof index === 'number') {
							localStorage.setItem(TOUR_STEP_KEY, String(index))
						}

						const btn = element as HTMLElement
						if (!btn) return

						btn.addEventListener(
							'click',
							() => setTimeout(() => driver.moveNext(), 300),
							{ once: true }
						)
					}
				},

				// 15. Подтверждение в модалке
				{
					element: '#blueModalButton',
					waitForElement: 5000,
					popover: {
						title: 'Подтверди выбор',
						description: 'Нажми на кнопку — все данные пропадут',
						side: 'bottom',
						showButtons: []
					},
					onHighlighted: (element, _, { driver, index }) => {
						if (typeof index === 'number') {
							localStorage.setItem(TOUR_STEP_KEY, String(index))
						}

						const btn = element as HTMLElement
						if (!btn) return

						btn.addEventListener(
							'click',
							() => setTimeout(() => driver.moveNext(), 300),
							{ once: true }
						)
					}
				},

				// 16. Конец
				{
					element: '#endOfTour',
					waitForElement: 3000,
					popover: {
						title: 'Поздравляю! Обучение окончено.',
						description:
							'Ты научился добавлять элементы и менять их местами. Можно создавать свои сметы.',
						side: 'bottom',
						showButtons: ['next'],
						doneBtnText: 'Готово!',
						onNextClick: (_el, _step, { driver }) => {
							localStorage.setItem(TOUR_COMPLETED_KEY, 'true')
							localStorage.removeItem(TOUR_STEP_KEY)
							isNavigatingRef.current = false
							driver.destroy()
						}
					}
				}
			],

			onDestroyed: () => {
				document.body.classList.remove('tour-allow-all-clicks')

				// Переход между страницами — progress уже в localStorage
				if (isNavigatingRef.current) {
					return
				}

				localStorage.setItem(TOUR_COMPLETED_KEY, 'true')
				localStorage.removeItem(TOUR_STEP_KEY)
			}
		})

		driverRef.current = driverObj

		const timer = setTimeout(() => {
			driverObj.drive(startIndex)
			isNavigatingRef.current = false
		}, 600)

		return () => {
			clearTimeout(timer)
			document.body.classList.remove('tour-allow-all-clicks')

			if (driverRef.current) {
				// Уход со страницы: не помечаем тур завершённым
				isNavigatingRef.current = true
				driverRef.current.destroy()
				driverRef.current = null
			}
		}
	}, [location.pathname])

	return null
}

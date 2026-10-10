import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useSmetaStore } from '../store/smetaStore'

const TOUR_COMPLETED_KEY = 'hasSeenInteractiveTour'
const TOUR_STEP_KEY = 'onboarding-step'

export function InteractiveTour() {
	const location = useLocation()
	const driverRef = useRef<ReturnType<typeof driver> | null>(null)
	const isNavigatingRef = useRef(false)

	useEffect(() => {
		if (localStorage.getItem(TOUR_COMPLETED_KEY) === 'true') return
		const { isDark } = useSmetaStore.getState()
		const savedStep = localStorage.getItem(TOUR_STEP_KEY)
		const isStartPage = location.pathname === '/' // ← твоя стартовая страница

		// Тур ещё не начат и мы не на стартовой странице
		if (savedStep === null && !isStartPage) return

		if (driverRef.current) {
			driverRef.current.destroy()
			driverRef.current = null
		}

		const startIndex = savedStep !== null ? Number(savedStep) : 0

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
				// 1. Кнопка добавить помещение
				{
					element: '#addPlaceButton',

					popover: {
						title: 'Создай первое помещение',
						description: 'Нажми на эту кнопку, чтобы создать новое помещение',
						side: 'bottom',
						showButtons: []
					},
					onHighlighted: (element, _, { driver }) => {
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

				// 2. Инпут в модалке
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

						textToInsert.split('').forEach((char, index) => {
							setTimeout(
								() => {
									nativeInputValueSetter?.call(input, input.value + char)
									input.dispatchEvent(new Event('input', { bubbles: true }))
								},
								delayPerChar * (index + 1)
							)
						})

						const totalTime = delayPerChar * textToInsert.length + 1500
						setTimeout(() => driver.moveNext(), totalTime)
					}
				},

				// 3. Кнопка «Добавить» в модалке
				{
					element: '#bluePlaceModalButton',
					waitForElement: 3000,
					popover: {
						title: 'Сохрани помещение',
						description: 'Нажми «Добавить», чтобы создать помещение',
						side: 'bottom',
						showButtons: []
					},
					onHighlighted: (element, _, { driver }) => {
						const btn = element as HTMLElement
						if (!btn) return

						btn.addEventListener(
							'click',
							() => setTimeout(() => driver.moveNext(), 400),
							{ once: true }
						)
					}
				},

				// 4. Кнопка добавить работу
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
								// Следующий шаг = индекс 4 (#categoriesToSelect)
								localStorage.setItem(TOUR_STEP_KEY, '4')
								isNavigatingRef.current = true
								driver.destroy()
								// навигация на /works/new произойдёт сама
							},
							{ once: true }
						)
					}
				},

				// 5. Выбор категории — можно тыкать куда угодно
				{
					element: '#categoriesToSelect',
					waitForElement: 4000,
					popover: {
						title: 'Выбери категорию',
						description: 'Нажми на любую категорию, чтобы открыть список работ',
						side: 'top',
						showButtons: []
					},
					onHighlightStarted: () => {
						document.body.classList.add('tour-allow-all-clicks')
					},
					onHighlighted: (_e, _, { driver }) => {
						// Слушаем клик по ВСЕМУ контейнеру категорий (делегирование)
						const root =
							document.querySelector('#categoriesToSelect')?.parentElement ??
							document.body

						const handler = (e: Event) => {
							const target = e.target as HTMLElement
							// Если кликнули по категории (подстрой под свой селектор)
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
					}
				},
				// 6. Выбор работы
				{
					element: '#worksToSelect',
					waitForElement: 4000,
					popover: {
						title: 'Выбери работу',
						description: 'Нажми на эту работу, чтобы добавить ее в смету',
						side: 'top',
						showButtons: []
					},
					onHighlightStarted: () => {
						document.body.classList.add('tour-allow-all-clicks')
					},
					onHighlighted: (_e, _, { driver }) => {
						// Слушаем клик по ВСЕМУ контейнеру категорий (делегирование)
						const root =
							document.querySelector('#worksToSelect')?.parentElement ??
							document.body

						const handler = (e: Event) => {
							const target = e.target as HTMLElement
							// Если кликнули по категории (подстрой под свой селектор)
							if (target.closest('[data-work], .works-item, #worksToSelect')) {
								root.removeEventListener('click', handler, true)

								setTimeout(() => driver.moveNext(), 400)
							}
						}

						root.addEventListener('click', handler, true)
					}
				},
				// 7. Просмотр данных
				{
					element: '#editingPage',

					popover: {
						title: 'Измени значения',
						description:
							'Все в твоих руках - изменяй все как твоей душе угодно. Ставь другую цену, единицу измерения, количество и даже название работы, которая будет добавлена. Для продолжения введи любое количество.',
						side: 'bottom',
						showButtons: []
					},
					onHighlightStarted: () => {
						document.body.classList.add('tour-allow-all-clicks')
					},
					onHighlighted: (_e, _, { driver }) => {
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
				// 8. Сохранить работу и вернуться на главную
				{
					element: '#addWorkButton',
					waitForElement: 3000,
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
								// Правильный доступ к store вне React-рендера
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

								// Следующий шаг на главной = index 8
								localStorage.setItem(TOUR_STEP_KEY, '8')
								isNavigatingRef.current = true
								driver.destroy()
								// навигация на / произойдёт сама от кнопки
							},
							{ once: true }
						)
					}
				},

				// 9. Показать первую работу на главной
				{
					element: '#secondWorkItem',
					waitForElement: 5000, // важно! элемент появится после возврата
					popover: {
						title: 'Ваша первая добавленная работа',
						description: 'Вот она появилась в смете',
						side: 'bottom',
						showButtons: ['next'] // или [] + свой обработчик
					},
					onHighlighted: (element, _, { driver }) => {
						// Просто показываем. Дальше — по кнопке Далее или по клику
						const btn = element as HTMLElement
						if (!btn) return

						btn.addEventListener(
							'click',
							() => setTimeout(() => driver.moveNext(), 300),
							{ once: true }
						)
					}
				},
				{
					element: '#firstWorkItem',
					waitForElement: 5000, // важно! элемент появится после возврата
					popover: {
						title: 'Еще одна работа',
						description: 'Она появилась для примера, чтобы показать функционал',
						side: 'bottom',
						showButtons: ['next'] // или [] + свой обработчик
					},
					onHighlighted: (element, _, { driver }) => {
						// Просто показываем. Дальше — по кнопке Далее или по клику
						const btn = element as HTMLElement
						if (!btn) return

						btn.addEventListener(
							'click',
							() => setTimeout(() => driver.moveNext(), 300),
							{ once: true }
						)
					}
				},
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
					onHighlighted: (element, _, { driver }) => {
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
					onHighlighted: (_e, _, { driver }) => {
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
				{
					element: '#saveReorder',
					popover: {
						title: 'Нажми на кнопку',
						description:
							'Сохрани изменения. Для этого можно также просто тыкнуть в пустое место',
						side: 'bottom',
						showButtons: [] // или [] + свой обработчик
					},
					onHighlighted: (element, _, { driver }) => {
						// Просто показываем. Дальше — по кнопке Далее или по клику
						const btn = element as HTMLElement
						if (!btn) return

						btn.addEventListener(
							'click',
							() => setTimeout(() => driver.moveNext(), 300),
							{ once: true }
						)
					}
				},
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
					onDeselected: () => {
						document.body.classList.remove('tour-allow-all-clicks')
					}
				},
				{
					element: '#deleteAllButton',
					popover: {
						title: 'Кнопка удаления всего',
						description: 'Удали все ненужные данные перед началом работы',
						side: 'bottom',
						showButtons: []
					},
					onHighlighted: (element, _, { driver }) => {
						const btn = element as HTMLElement
						if (!btn) return

						btn.addEventListener(
							'click',
							() => setTimeout(() => driver.moveNext(), 300),
							{ once: true }
						)
					}
				},
				{
					element: '#blueModalButton',
					popover: {
						title: 'Подтверди выбор',
						description: 'Нажми на кнопку и все данные пропадут.',
						side: 'bottom',
						showButtons: []
					},
					onHighlighted: (element, _, { driver }) => {
						const btn = element as HTMLElement
						if (!btn) return

						btn.addEventListener(
							'click',
							() => setTimeout(() => driver.moveNext(), 300),
							{ once: true }
						)
					}
				},
				{
					element: '#endOfTour',
					popover: {
						title: 'Поздравляю! Обучение окончено.',
						description:
							'Ты научился добавлять элементы и менять их местами, а теперь ты можешь приступать к созданию собственных смет.',
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
			isNavigatingRef.current = false // ← обязательно
		}, 600)

		return () => {
			clearTimeout(timer)
			if (!isNavigatingRef.current && driverRef.current) {
				driverRef.current.destroy()
			}
		}
	}, [location.pathname])

	return null
}

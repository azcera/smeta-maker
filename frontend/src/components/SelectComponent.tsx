import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useSmetaStore } from '../store/smetaStore'

export type SwitcherOption = {
	id: string
	name: string
}

interface Props {
	value: string
	setValue: (value: string) => void
	options: SwitcherOption[]
	className?: string
	buttonClassName?: string
	name: string
}

export function SelectComponent({
	value,
	setValue,
	className,
	name,
	options,
	buttonClassName
}: Props) {
	const [isOpen, setIsOpen] = useState(false)
	const [isMobile, setIsMobile] = useState(false)
	const containerRef = useRef<HTMLDivElement>(null)
	const { isDark } = useSmetaStore()

	const themeClasses = isDark
		? 'bg-neutral-800 text-white'
		: 'bg-slate-50 text-black'

	const selected = options.find(o => o.id === value)

	// Определяем мобильное устройство
	useEffect(() => {
		const checkMobile = () => {
			const isIos = /iPhone|iPad|iPod/i.test(navigator.userAgent)
			setIsMobile(isIos)
		}

		checkMobile()
		window.addEventListener('resize', checkMobile)
		return () => window.removeEventListener('resize', checkMobile)
	}, [])

	// Закрытие кастомного селекта при клике снаружи (только десктоп)
	useEffect(() => {
		if (isMobile) return

		const handleClickOutside = (e: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setIsOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [isMobile])

	// ——— Мобильная версия (нативный select) ———
	if (isMobile) {
		return (
			<div
				className={
					className ??
					`${themeClasses} py-1 relative flex p-1 justify-center items-center rounded-lg cursor-pointer select-none max-w-full text-base`
				}
			>
				<select
					size={8}
					value={value}
					onChange={e => setValue(e.target.value)}
					onFocus={() => setIsOpen(true)}
					onBlur={() => setIsOpen(false)}
					className={
						buttonClassName ??
						`${themeClasses} py-1 w-full flex items-center justify-between cursor-pointer pr-10 pl-2 focus:outline-0 appearance-none rounded-md truncate`
					}
				>
					<optgroup label={name}>
						{options.map(o => (
							<option
								key={o.id}
								value={o.id}
							>
								{o.name}
							</option>
						))}
					</optgroup>
				</select>

				<ChevronDown
					className={`
            w-5 h-5 absolute right-3 pointer-events-none
            transition-transform duration-200
            ${isOpen ? 'rotate-180' : 'rotate-0'}
          `}
				/>
			</div>
		)
	}

	// ——— Десктопная версия (кастомный) ———
	return (
		<div
			ref={containerRef}
			className={
				className ??
				`${themeClasses} py-1 relative flex p-1 justify-center items-center rounded-lg cursor-pointer select-none max-w-full text-base overflow-visible`
			}
		>
			<button
				type='button'
				onClick={() => setIsOpen(prev => !prev)}
				className={
					buttonClassName ??
					`${themeClasses} py-1 w-full flex items-center justify-between pr-10 pl-2  rounded-md truncate text-left`
				}
			>
				<span className='truncate'>{selected?.name ?? 'Выберите...'}</span>
			</button>

			<ChevronDown
				className={`
          w-5 h-5 absolute right-3 pointer-events-none
          transition-transform duration-200
          ${isOpen ? 'rotate-180' : 'rotate-0'}
        `}
			/>

			{isOpen && (
				<ul
					className={`
            absolute top-full left-0 right-0 mt-1 z-50
            rounded-md shadow-lg overflow-hidden border
            ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-slate-200'}
          `}
				>
					{options.map(o => (
						<li
							key={o.id}
							onClick={() => {
								setValue(o.id)
								setIsOpen(false)
							}}
							className={`
                px-3 py-2 cursor-pointer truncate
                ${
									o.id === value
										? isDark
											? 'bg-neutral-700'
											: 'bg-slate-200'
										: isDark
											? 'hover:bg-neutral-700'
											: 'hover:bg-slate-100'
								}
              `}
						>
							{o.name}
						</li>
					))}
				</ul>
			)}
		</div>
	)
}

import { useRef, useState } from "react"

export function Accordeon({ title, children, bgColor = 'bg-gray-600' }: any)
{
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const selfRef = useRef<HTMLDivElement>(null)

	return (
		<div className="accordeon">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className='flex flex-row justify-between
					text-right
					w-full px-5
					hover:bg-gray-500 hover:text-white
					focus:bg-gray-500
					rounded'>
				{title}
				<span>
					{isOpen ? '-' : '+'}
				</span>
			</button>
			<div ref={selfRef} className={`${bgColor} ${(isOpen) ? `scale-y-100 h-full` : "scale-y-0 h-0"} shadow origin-top duration-300 transition-scale-y ease-in-out`}>
				{
					children
				}
			</div>
		</div>
	)
}

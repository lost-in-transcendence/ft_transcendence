import { useRef, useState } from "react"

export function Accordeon({ title, children, bgColor = 'bg-gray-600', width = 'w-full', childrenClassName = '', parentClassName = '' }: any)
{
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const selfRef = useRef<HTMLDivElement>(null)

	return (
		<div className={`accordeon ${isOpen && ''}`}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className={
					`flex flex-row justify-between
					text-right
					${width} px-5 gap-6
					hover:bg-gray-500 hover:text-white
					focus:bg-gray-500
					rounded ${parentClassName} `}>
				{title}
				<span className="my-auto">
					{isOpen ? '-' : '+'}
				</span>
			</button>
			<div ref={selfRef} className={`${bgColor} ${(isOpen) ? `scale-y-100 h-fit` : "scale-y-0 h-0"} shadow origin-top duration-300 transition-scale-y ease-in-out ${childrenClassName}`}>
				{
					children
				}
			</div>
			{
				isOpen &&
				<div className="flex justify-center items-center">
					<hr className="my-2 w-1/2 border-gray-500 " />
				</div>
			}
		</div>
	)
}

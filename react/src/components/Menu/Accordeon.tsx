import { useRef, useState } from "react"

export function Accordeon({title, children}: any)
{
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const selfRef = useRef<HTMLDivElement>(null)
	console.log(selfRef.current?.scrollHeight)
	return (
		<div className="accordeon">
			<button onClick={() => setIsOpen(!isOpen)} className='flex flex-row justify-between text-right w-full z-10 px-5'>{title}<span>{isOpen ? '-' : '+'}</span></button>
			<div ref={selfRef} className={`bg-orange-500 ${(isOpen) ? `h-[${selfRef.current?.scrollHeight}px]` : "h-0"} origin-top duration-1000 transition-all ease-linear  overflow-hidden`}>
			{
				children
			}
			</div>
		</div>
	)
}

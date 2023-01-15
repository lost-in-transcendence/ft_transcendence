import { MouseEventHandler, ReactNode } from "react";

export function Selection({children, onClick, className, isActive} : {children: ReactNode, onClick: MouseEventHandler<HTMLDivElement>, className?: string, isActive: boolean})
{
	return (
		<div className={`flex-1 hover:bg-gray-600 h-[50px] text-center items-center justify-center gap-4 flex cursor-pointer ${isActive ? 'bg-gray-700 text-white' : 'text-gray-500'} ${className}`} onClick={onClick}>
			{children}
		</div>
	)
}
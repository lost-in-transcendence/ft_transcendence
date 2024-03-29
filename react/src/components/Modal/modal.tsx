import './modal.css'

import { ReactNode, useEffect, useState } from 'react'
import ReactDOM from 'react-dom';
import { ImCross as CloseButton } from 'react-icons/im'
import { Spinner } from '../Spinner/Spinner';

interface IModalProps
{
	isOpen: boolean
	onClose: any
	children: any
	onOpen?: any
	className?: string
}

export default function Modal({ isOpen, onClose, children, onOpen, className = 'bg-gray-300 rounded' }: IModalProps)
{
	const [displayChild, setDisplayChild] = useState(false);
	useEffect(() =>
	{
		async function openEvent()
		{
			const ret = await onOpen();
			if (ret === true)
				setDisplayChild(true);
		}
		if (isOpen === true && !onOpen)
		{
			setDisplayChild(true);
		}
		else if (onOpen && isOpen === true)
		{
			openEvent();
		}
		if (isOpen === false)
			setDisplayChild(false);
	}, [isOpen])

	function closeModal()
	{
		setDisplayChild(false);
		onClose();
	}

	return ReactDOM.createPortal(

		<div className={`modal-overlay z-[9999] ${isOpen ? 'modal-open' : ''}`} onClick={(e) => { e.stopPropagation(); closeModal() }}>
			<div className={`modal-content ${className}`} onClick={e => e.stopPropagation()}>
				<div className="modal-body">
					{
						displayChild ?
							children
							:
							<div className="flex flex-col justify-center items-center h-full w-full">
								<h1 className="text-indigo-300 mb-2 text-3xl">Loading ...</h1>
								<Spinner />
							</div>
					}
				</div>
				<button
					onClick={closeModal}
					className="absolute right-1 top-1 text-red-700"
				>
					<CloseButton size={'12'} />
				</button>
			</div>
		</div>,
		document.getElementById('root')!
	)
}

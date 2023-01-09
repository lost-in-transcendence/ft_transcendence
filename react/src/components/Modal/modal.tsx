import './modal.css'

import { ReactNode, useEffect, useState } from 'react'
import ReactDOM from 'react-dom';
import { ImCross as CloseButton } from 'react-icons/im'

export default function Modal(props: { isOpen: boolean, onOpen?: any, onClose: any, children: any })
{
	const [displayChild, setDisplayChild] = useState(false);
	useEffect(() =>
	{
		async function openEvent()
		{
			console.log('in openEvent');
			const ret = await props.onOpen();
			if (ret === true)
				setDisplayChild(true);
		}
		if (props.isOpen === true && !props.onOpen)
		{
			setDisplayChild(true);
		}
		else if (props.onOpen && props.isOpen === true)
		{
			openEvent();
		}
		if (props.isOpen === false)
			setDisplayChild(false);
	}, [props.isOpen])

	function closeModal()
	{
		console.log('in close modal');
		setDisplayChild(false);
		props.onClose();
	}

	return ReactDOM.createPortal(

		<div className={`modal-overlay z-20 ${props.isOpen ? 'modal-open' : ''}`} onClick={(e) => { e.stopPropagation(); closeModal() }}>
			<div className="modal-content bg-gray-300 rounded" onClick={e => e.stopPropagation()}>
				<div className="modal-body">
					{displayChild ? props.children : null}
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

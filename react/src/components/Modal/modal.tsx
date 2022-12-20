// import './modal.css'

import { ReactNode, useEffect, useState } from 'react'
import ReactDOM from 'react-dom';

export default function Modal(props: {isOpen : boolean, onOpen?: any, onClose: any, children: any})
{
    const [displayChild, setDisplayChild] = useState(false);
    useEffect(() =>
    {
        async function openEvent()
        {
            const ret = await props.onOpen();
            if (ret === true)
                setDisplayChild(true);

        }
        if (props.isOpen === true && !props.onOpen )
        {
            setDisplayChild(true);
        }
        if (props.isOpen === true)
        {
            openEvent();
        }

    }, [props.isOpen])

    function closeModal()
    {
        setDisplayChild(false);
        props.onClose();
    }

    return ReactDOM.createPortal(

        <div className={`modal-overlay ${props.isOpen ? 'modal-open' : ''}`} onClick={closeModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-body">
                    {displayChild ? props.children : null}
                </div>
                <button onClick={closeModal}>Close</button>
            </div>
        </div>,
        document.getElementById('root')!
        )
}

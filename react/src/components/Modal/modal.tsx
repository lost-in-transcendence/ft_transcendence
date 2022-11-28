import { ReactNode, useEffect, useState } from 'react'
import ReactDOM from 'react-dom';
import './modal.css'

export default function Modal(props: {isOpen : boolean, onOpen: any, onClose: any, children: any})
{
    const [displayChild, setDisplayChild] = useState(false);
    useEffect(() =>
    {
        async function openEvent()
        {
             console.log("bbbbbbbb")
            const res = await props.onOpen();
            if (res.ok === true)
                setDisplayChild(true);
            
           }
        if (props.isOpen === true)
        {
            openEvent();
        }
        // return () => {security = false};

    }, [props.isOpen])
    // if (props.isOpen !== true)
    // {
    //     return (<></>);
    // }
    return ReactDOM.createPortal(

        <div className={`modal-overlay ${props.isOpen ? 'modal-open' : ''}`} onClick={props.onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-body">
                    {displayChild ? props.children : null}
                </div>
                <button onClick={props.onClose}>Close</button>
            </div>
        </div>,
        document.getElementById('root')!
        )
}
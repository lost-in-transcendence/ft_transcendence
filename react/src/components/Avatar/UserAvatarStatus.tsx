import { useEffect, useState } from "react";
import { parseClassName } from "react-toastify/dist/utils";
import { SharedUserStatus } from "../../../shared/dtos";
import { backURL } from "../../requests";

export function UserAvatarStatus({userName, status, size = '12', border = 'border-gray-900', className = ''} : {userName: string, status: SharedUserStatus, size: string, border: string, className: string})
{
	const [statusImg, setStatusImg] = useState('');

	useEffect(() =>
    {
        const baseUrl = '/assets/';
        if (status == 'ONLINE')
            setStatusImg(baseUrl + 'online.png');
        else if (status == 'OFFLINE')
            setStatusImg(baseUrl + 'offline.png');
        else if (status == 'BUSY')
            setStatusImg(baseUrl + 'busy.png');
        else if (status == 'AWAY')
            setStatusImg(baseUrl + 'away.png');
    }, [status])
	
	return (
		
		// <div className={dropdown ? 'hover' : ''}>
        <>
			<div className={"m-auto inline-block relative " + className}>
				<img className={`w-${size} rounded-full border-4 ` + border} src={`${backURL}/users/avatars/${userName}?time=${Date.now()}`} />
				<img className={"w-[45%] absolute bottom-0 right-0 rounded-full border-[4px] " + border} alt=" " aria-hidden="true" src={statusImg}></img>
			</div>
			<span className="arrow" />
        </>
	)
}
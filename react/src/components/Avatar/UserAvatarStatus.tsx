import { useEffect, useState } from "react";
import { parseClassName } from "react-toastify/dist/utils";
import { SharedUserStatus } from "../../../shared/dtos";
import { backURL } from "../../requests";

export function UserAvatarStatus({userName, status, size = '12', border = 'border-gray-900', className = ''} : {userName: string, status: SharedUserStatus, size: string, border: string, className: string})
{	
	return (
		<>
			<div className={"m-auto inline-block relative " + className}>
				<img className={`w-${size} rounded-full border-4 ` + border} src={`${backURL}/users/avatars/${userName}?time=${Date.now()}`} />
				<CurrentStatus className={"w-[40%] absolute bottom-0 right-0 rounded-full border-[4px] " + border} status={status}/>
			</div>
        </>
	)
}

export function UserAvatarStatusProfile({userName, status, border = 'border-gray-900'} : {userName: string, status: SharedUserStatus, border: string})
{
	return (
	    <>
			<div className={"m-auto inline-block relative"}>
				<img className={`w-[80px] rounded-full border-[6px] ` + border} src={`${backURL}/users/avatars/${userName}?time=${Date.now()}`} />
				<CurrentStatus className={"z-[100] w-[35%] absolute bottom-0 right-0 rounded-full border-[6px] " + border} status={status} />
			</div>
        </>
	)
}

export function CurrentStatus(props: {className: string, status: SharedUserStatus})
{
    const {className, status} = props;
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
        <>
            <img className={className} src={statusImg} />
        </>
    )
}
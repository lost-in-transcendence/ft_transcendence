import { useEffect, useState } from "react";
import { parseClassName } from "react-toastify/dist/utils";
import { SharedUserStatus } from "../../../shared/dtos";
import { backURL } from "../../requests";

import {onlineIcon, offlineIcon, busyIcon, awayIcon} from '../../../assets'

export function UserAvatarStatus({userName, status, size = '12', border = 'border-gray-900', className = ''} : {userName: string, status: SharedUserStatus, size?: string, border?: string, className?: string})
{
	return (
		<>
			<div className={"m-auto inline-block relative " + className}>
				<img className={`w-${size} h-${size} rounded-full border-4 ` + border}
                // style={{width: `${size}px`}}
                src={`${backURL}/users/avatars/${userName}?time=${Date.now()}`} />
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
        if (status == 'ONLINE')
            setStatusImg(onlineIcon);
        else if (status == 'OFFLINE')
            setStatusImg(offlineIcon);
        else if (status == 'BUSY')
            setStatusImg(busyIcon);
        else if (status == 'AWAY')
            setStatusImg(awayIcon);
    }, [status])

    return (
        <>
            <img className={className} src={statusImg} />
        </>
    )
}

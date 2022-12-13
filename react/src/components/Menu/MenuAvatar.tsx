import { useContext, useEffect, useState } from "react";
import { User } from "../../dto/users.dto";
import { backURL, getUserMe } from "../../requests";
import SocketContext from "../Socket/socket-context";
import { AvatarDropdown } from "./AvatarDropdown";

export function MenuAvatar()
{
    const [dropdown, setDropdown] = useState(false);
    const [user, setUser] = useState<User>();
    const {status} = useContext(SocketContext).SocketState.user;
    const [statusImg, setStatusImg] = useState('');

    useEffect(() =>
    {
        async function loadUser()
        {
            const res = await getUserMe();
            const loadedUser =  await res.json();
            setUser(loadedUser);
        }
        loadUser();
    }, []);

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
        <li className="menu-items">
            <div onMouseEnter={() => setDropdown(true)} onMouseLeave={() => setDropdown(false)} >
                {/* <Link to=> */}
                    <div className={dropdown ? 'hover' : ''}>
                        <div className="avatar-wrapper">
						    <img className="avatar" src={`${backURL}/users/avatars/${user?.userName}?time=${Date.now()}`} />
                            <img className="status" alt=" " aria-hidden="true" src={statusImg}></img>
						</div>
                        <span className="arrow" />
                    </div>
                {/* </Link> */}
                <AvatarDropdown dropdown={dropdown}/>
            </div>
        </li>
    )
}
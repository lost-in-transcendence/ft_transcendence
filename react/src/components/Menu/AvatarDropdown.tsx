import { useContext, useState } from "react";
import { Link, redirect, useNavigate } from "react-router-dom";
import { SharedUserStatus } from "../../../shared/dtos";
import { logout } from "../../requests";
import { changeStatus } from "../../requests/ws/users.messages";
import SocketContext from "../Socket/socket-context";

export function AvatarDropdown(props: {dropdown: boolean})
{
    const {dropdown} = props;
    const [dropdown2, setDropdown2] = useState(false);
    const {SocketState, SocketDispatch} = useContext(SocketContext);
    const {user, socket} = SocketState;
    const navigate= useNavigate();

    return (
        <ul className={`dropdown ${dropdown? "show" : ""}`}>
            <li key={1} className="menu-items">
                <div onMouseEnter={() => setDropdown2(true)} onMouseLeave={() => setDropdown2(false)} >
                    <button className={dropdown ? 'hover' : ''}>
                        Change Status
                        <span>&raquo;</span>
                    </button>
                    <ul className={`dropdown dropdown-submenu ${dropdown2? "show" : ""}`}>
                        <li key={1} className="menu-items">
                            <button onClick={() => changeStatus(socket, SharedUserStatus.ONLINE)}>Online</button>
                        </li>
                        <li key={2} className="menu-items">
                            <button onClick={() => changeStatus(socket, SharedUserStatus.OFFLINE)}>Invisible</button>
                        </li>
                        <li key={3} className="menu-items">
                            <button onClick={() => changeStatus(socket, SharedUserStatus.AWAY)}>Away</button>
                        </li>
                        <li key={4} className="menu-items">
                            <button onClick={() => changeStatus(socket, SharedUserStatus.BUSY)}>Busy</button>
                        </li>
                    </ul>
                </div>
            </li>
            <li key={2} className="menu-items">
                <Link to='/profile'>View Profile</Link>
            </li>
            <li key={3} className="menu-items">
                <button onClick={() => {logout(); navigate("/login")}}>Logout</button>
            </li>
        </ul>
    )
}
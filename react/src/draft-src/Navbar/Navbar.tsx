import { MouseEventHandler, useState } from 'react'
import './Navbar.css'

type PropType = {
    chatIsExpanded: boolean;
    clickHandler: any;
}

export default function Navbar ({chatIsExpanded, clickHandler}: PropType)
{
    // The following code should and will be divided into components. One could imagine
    // a <Menu> component, which would contain a <MenuLogo> and a <Nav> component. The
    // <Nav> component could have multiple <NavItem> components...
    return(
        <div className="navbar">
            <div className="menu_wrap">
                <div className="menu">
                <div className="menu_logo_wrap">
                    <div className="menu_logo">
                        <p style={{ margin: "0", fontSize: "25px" }}>LOGO</p>
                    </div>
                </div>
                <div className="menu_nav_wrap">
                    <div className="menu_nav">
                        <nav>
                            <ul>
                                <li key="navbar-play">
                                    <a href="#">
                                        PLAY
                                    </a>
                                </li>
                                <li key="navbar-chat">
                                    <a href="#">
                                        CHAT
                                    </a>
                                </li>
                                <li key="navbar-leaderboard">
                                    <a href="#">
                                        LEADERBOARD
                                    </a>
                                </li>
                                <li key="navbar-profile">
                                    <a href="#">
                                        PROFILE
                                    </a>
                                </li>
                                <li key="navbar-login">
                                    <a style={{color: 'brown'}} href="#">
                                        LOGOUT
                                    </a>
                                </li>
                                <li key='collapse'>
                                    <a href='#' onClick={() => clickHandler(!chatIsExpanded)}>
                                        {
                                            chatIsExpanded ? 'Collapse Chat' : 'Extend Chat'
                                        }
                                    </a>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
                </div>
            </div>
        </div>
    )
}
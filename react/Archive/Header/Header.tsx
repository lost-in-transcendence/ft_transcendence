
import './Header.css'

export default function Header ()
{
    return (
        <div className='header_wrap'>
            <Login />
            <Menu />
        </div>
    )
}

export function Login ()
{
    return (
        <div className="header_login_row_wrap">
            <div className="header_login_row">
                <div className='header_login_wrap'>
                    <div className="header_login">
                        <span className='header_login_button'>
                            Register | Login
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function Menu ()
{
    return (
        <div className="header_menu_row_wrap">
            <div className="header_menu_row">
                <div className="header_logo_wrap">
                    <h2 id="logo">
                        AmalGAm
                    </h2>
                </div>
                <div className="header_nav_wrap">
                    <ul>
                        <li key="nav_play" className="nav_item">
                            <a href="#" className="nav_item_content">PLAY</a>
                        </li>
                        <li key="nav_chat" className="nav_item">
                            <a href="#" className="nav_item_content">CHAT</a>
                        </li>
                        <li key="nav_leaderboard" className="nav_item">
                            <a href="#" className="nav_item_content">LEADERBOARD</a>
                        </li>
                        <li key="nav_profile" className="nav_item">
                            <a href="#" className="nav_item_content">MY PROFILE</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
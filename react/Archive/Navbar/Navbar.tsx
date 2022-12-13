import { MouseEventHandler, useContext, useEffect, useState } from 'react'
import { Link, NavLink, redirect, useNavigate } from 'react-router-dom';
// import { AuthContext } from '../../auth/AuthContext';
// import { User } from '../../dto/users.dto';
// import { backURL, getUser, getUserMe, logout } from '../../requests';
import './Navbar.css'

export default function Navbar() {
	// The following code should and will be divided into components. One could imagine
	// a <Menu> component, which would contain a <MenuLogo> and a <Nav> component. The
	// <Nav> component could have multiple <NavItem> components...

	// const auth = useContext(AuthContext);
	// const navigate = useNavigate();
	// const [user, setUser] = useState<User>();

	// useEffect(() =>
	// {
	// 	async function loadUser()
	// 	{
	// 		const res = await getUserMe();
	// 		const fetchedUser = await res.json()
	// 		setUser(fetchedUser);
	// 	}
	// 	loadUser();
	// }, [])


	// return (
	// 	<div className="navbar">
	// 		<div className="menu_wrap">
	// 			<div className="menu">
	// 				<div className="menu_logo_wrap">
	// 					<div className="menu_logo">
	// 						<Link to={'/'}>
	// 							<p style={{ margin: "0", fontSize: "25px" }}>PONG !</p>
	// 						</Link>
	// 					</div>
	// 				</div>
	// 				<div className="menu_nav_wrap">
	// 					<div className="menu_nav">
	// 						<nav>
	// 							<ul>
	// 								<li key="navbar-play">
	// 									<NavLink
	// 										to={"/game"}
	// 										style={({isActive}) => isActive ? {textDecoration: "underline"} : undefined}
	// 									>
	// 											PLAY
	// 									</NavLink>
	// 								</li>
	// 								<li key="navbar-chat">
	// 									<NavLink
	// 										to={'/chat'}
	// 										style={({isActive}) => isActive ? {textDecoration: "underline"} : undefined}
	// 									>
	// 										CHAT
	// 									</NavLink>
	// 								</li>
	// 								<li key="navbar-leaderboard">
	// 									<NavLink
	// 										to="/leaderboard"
	// 										style={({isActive}) => isActive ? {textDecoration: "underline"} : undefined}
	// 									>
	// 										LEADERBOARD
	// 									</NavLink>
	// 								</li>
	// 								<li key="navbar-profile">
	// 									<NavLink
	// 										to="/profile"
	// 										style={({isActive}) => isActive ? {textDecoration: "underline"} : undefined}
	// 									>
	// 										PROFILE
	// 									</NavLink>
	// 								</li>
	// 								<li key="navbar-login">
	// 									<div>
	// 										<div className="avatar-wrapper">
	// 											<img className="avatar" src={`${backURL}/users/avatars/${user?.userName}?time=${Date.now()}`} />
    //                                     		<img className="status" alt=" " aria-hidden="true" src="/assets/online.png"></img>
	// 										</div>
	// 									</div>
	// 									<div className="user-hover-wrapper">

	// 									<ul className="user-hover-menu">
	// 										<li key={123}>Change Status
	// 											<ul style={{position: 'absolute', left: "auto"}}>
	// 												<li style={{position: 'relative'}}>Hello</li>
	// 											</ul>
	// 										</li>
	// 										<li key={456}>Edit Profile</li>
	// 										<li key={789}>Log Out!!!!</li>
	// 									</ul>
	// 									</div>
	// 								</li>
	// 							</ul>
	// 						</nav>
	// 					</div>
	// 				</div>
	// 			</div>
	// 		</div>
	// 	</div>
	// )
}

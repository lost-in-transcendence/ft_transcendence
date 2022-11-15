import { MouseEventHandler, useContext, useState } from 'react'
import { Link, NavLink } from 'react-router-dom';
import { AuthContext } from '../../auth/AuthContext';
import './Navbar.css'

export default function Navbar() {
	// The following code should and will be divided into components. One could imagine
	// a <Menu> component, which would contain a <MenuLogo> and a <Nav> component. The
	// <Nav> component could have multiple <NavItem> components...

	const auth = useContext(AuthContext);

	return (
		<div className="navbar">
			<div className="menu_wrap">
				<div className="menu">
					<div className="menu_logo_wrap">
						<div className="menu_logo">
							<Link to={'/home'}>
								<p style={{ margin: "0", fontSize: "25px" }}>PONG !</p>
							</Link>
						</div>
					</div>
					<div className="menu_nav_wrap">
						<div className="menu_nav">
							<nav>
								<ul>
									<li key="navbar-play">
										<NavLink
											to={"/game"}
											style={({isActive}) => isActive ? {textDecoration: "underline"} : undefined}
										>
												PLAY
										</NavLink>
									</li>
									<li key="navbar-chat">
										<NavLink
											to={'/chat'}
											style={({isActive}) => isActive ? {textDecoration: "underline"} : undefined}
										>
											CHAT
										</NavLink>
									</li>
									<li key="navbar-leaderboard">
										<NavLink
											to="/leaderboard"
											style={({isActive}) => isActive ? {textDecoration: "underline"} : undefined}
										>
											LEADERBOARD
										</NavLink>
									</li>
									<li key="navbar-profile">
										<NavLink
											to="/profile"
											style={({isActive}) => isActive ? {textDecoration: "underline"} : undefined}
										>
											PROFILE
										</NavLink>
									</li>
									<li key="navbar-login">
										<a
										style={{ color: 'brown' }}
										href="#"
										onClick={() => auth.logout()}
										>
											LOGOUT
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

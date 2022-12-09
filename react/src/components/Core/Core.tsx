import { useEffect, useState } from 'react'
import '../../App.css'
import {Navbar} from '../Menu/Navbar'

import './Core.css'
import { Link, Outlet } from 'react-router-dom'

function Core() {
	return (
		<>
		<div style={{backgroundColor: 'green'}}>

			<div className='nav-area'>
				<Link to='/' className='logo'>
					Pong!
				</Link>
				<Navbar />
			</div>
		</div>
			<div className="wrapper">
				<div className="game">
					<Outlet />
				</div>
			</div>
		</>
	)
}

export default Core

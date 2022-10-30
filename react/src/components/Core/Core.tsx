import { useEffect, useState } from 'react'
import '../../App.css'
import Navbar from '../Navbar/Navbar'

import './Core.css'
import { Outlet } from 'react-router-dom'

function Core() {
	return (
		<>
			<Navbar />
			<div className="wrapper">
				<div className="game">
					<Outlet />
				</div>
			</div>
		</>
	)
}

export default Core

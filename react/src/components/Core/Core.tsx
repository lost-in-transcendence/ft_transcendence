// import '../../App.css'
// import './Core.css'

import { Link, Outlet } from 'react-router-dom'
import { SideBar } from '../Menu/Sidebar'

function Core() {
	return (
		<div className='flex flex-row'>
			<SideBar />
			<div className='bg-gray-800 basis-full'>
				<Outlet />
			</div>
		</div>
	)
}

export default Core

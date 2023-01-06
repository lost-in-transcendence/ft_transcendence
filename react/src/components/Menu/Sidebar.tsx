import { BsPersonFill as ProfileIcon } from 'react-icons/bs'
import { GiPingPongBat as PongIcon, GiStarsStack as LeaderBoardIcon } from 'react-icons/gi'
import { AiOutlineHome as HomeIcon, AiOutlinePoweroff as LogoutIcon } from 'react-icons/ai'
import { IoChatbubbleEllipsesSharp as ChatIcon } from 'react-icons/io5'
import { NavLink, useNavigate } from 'react-router-dom'
import { logout } from '../../requests'
import { UserAvatarStatus } from '../Avatar/UserAvatarStatus'
import { useContext, useState } from 'react'
import SocketContext from '../Socket/socket-context'
import { SharedUserStatus } from '../../../shared/dtos'

export function SideBar()
{
	const {user} = useContext(SocketContext).SocketState;
	const [dropdownDisplay, setDropdownDisplay] = useState(false);

	return (
		<div className="grow-0 shrink-0 basis-14
						flex flex-col justify-between
						bg-gray-900 text-white shadow-lg">
			<div className='basis-1/10'>
				<NavLink to={'/'}>
					<SideBarIcon icon={<HomeIcon size='20' />} tooltip='Home' />
				</NavLink>
			</div>
			<hr className='self-center w-12 border-gray-700' />
			<div className='basis-full overflow-hidden scrollbar-hide'>
				<NavLink to={'/game'}>
					<SideBarIcon icon={<PongIcon size='20' />} tooltip='Play !' />
				</NavLink>

				<NavLink to={'/chat'}>
					<SideBarIcon icon={<ChatIcon size='20' />} tooltip='Chat' />
				</NavLink>

				<NavLink to={'/profile'}>
					<SideBarIcon icon={<ProfileIcon size='20' />} tooltip='Profile' />
				</NavLink>

				<NavLink to={'/leaderboard'}>
					<SideBarIcon icon={<LeaderBoardIcon size='20' />} tooltip='LeaderBoard' />
				</NavLink>
			</div>
			<hr className='self-center w-12 border-gray-700 pb-3' />
			<div className='basis-1/10'>

				<div 
				className={`text-center group flex relative py-2 hover:bg-gray-800 transition-all duration-300 ease-linear`} 
				onClick={() => setDropdownDisplay(true)} >
				{/* // onMouseLeave={() => setDropdownDisplay(false)}> */}
						{/* <span className='icon-tooltip group-hover:scale-100'>{'ta mere'}</span> */}
						{ dropdownDisplay ? <SideBarAvatarMenu userName={user.userName} status={user.status} /> : <></>}
						<UserAvatarStatus userName={user.userName} status={user.status} size={'12'} border={'border-gray-900'} className={''}/>
						{/* { dropdownDisplay ? <SideBarAvatarMenu userName={user.userName} status={user.status} /> : <></>} */}
				</div>

				{/* <NavLink to={'/login'}>
					<SideBarIcon icon={<LogoutIcon size='20' />} tooltip='LogOut' />
				</NavLink> */}
			</div>
		</div>
	)
}

function SideBarIcon({ icon, tooltip = 'tooltip' }: any)
{
	return (
		<div className='sidebar-icon group' onClick={() =>
		{
			if (tooltip === 'LogOut')
				logout();
		}}>
			{icon}
			<span className='icon-tooltip group-hover:scale-100'>{tooltip}</span>
		</div>
	)
}

function SideBarAvatarMenu(props: {userName: string, status: SharedUserStatus})
{
	const [dropdownDisplay, setDropdownDisplay] = useState(false);
	const {user} = useContext(SocketContext).SocketState;

	// return (
	// 	<ul className='dropdown'>
	// 		<li key={1} className='menu-items'>
	// 			<div onMouseEnter={() => setDropdownDisplay(true)} onMouseLeave={() => setDropdownDisplay(false)}>
	// 				<button className='menu-button'>
	// 					Change Status
    //                     <span>&raquo;</span>
	// 				</button>
	// 				{
	// 					dropdownDisplay ?
	// 					<ul className='dropdown'>
	// 						<li className='menu-items'>
	// 							fuck yeah
	// 						</li>
	// 					</ul>
	// 					:
	// 					<>
	// 					</>
	// 				}
	// 			</div>
	// 		</li>
	// 	</ul>
	//	)
	const offset = 64;
	return (
		// <ul className='dropdown top-[-336px]'>
		// 	<div className="w-28 h-[400px]">
		// 	<UserAvatarStatus userName={user.userName} status={user.status} size={'14'} border={'border-gray-900'} className={''}/>
		// 		Hello how are you
		// 	</div>
		// 	{/* <li className='menu-items'> */}
		// 		{/* Hello */}
		// 	{/* </li> */}
		// </ul>

		<div className="absolute left-[56px] top-[-300px] z-[9999] w-[250px] mt-auto mx-auto mb-0 rounded-[4px] border-1 border-white bg-[#2f3136] flex flex-col">
			<div className="pt-[15px] mx-0 my-auto w-full justify-center bg-[#202225] text-white">
				<div className="mx-auto my-auto overflow-hidden w-[80px] h-[80px]">
					{/* <img src="https://discord.com/assets/6debd47ed13483642cf09e832ed0bc1b.png" /> */}
					<UserAvatarStatus userName={user.userName} status={user.status} size={'full'} border={'border-gray-900'} className={''}/>

				</div>
				<div className="mx-[15px] my-auto text-center font-thin text-[14px]">
					<span><strong>Discordian</strong>#1234</span>
				</div>
			</div>
			<div>
				Hello fuck you
			</div>
			{/* <div className="role">
				<span><strong>NO ROLES</strong></span>
			</div>
			<div className="note">
				<div className="noteheader">
					<span><strong>NOTE</strong></span>
				</div>
				<textarea>Click here to add a note</textarea>
			</div>
			<div className="message">
				<input type="text" id="message" placeholder="Message @Discordian" autofocus />
			</div>
			<div className="tip">
				<span><strong>PROTIP: </strong>Right click user for more actions</span>
			</div> */}
		</div>
	)
}

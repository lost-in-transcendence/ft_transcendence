import { BsPencilFill, BsPersonFill as ProfileIcon } from 'react-icons/bs'
import { GiPingPongBat as PongIcon, GiStarsStack as LeaderBoardIcon } from 'react-icons/gi'
import { AiOutlineHome as HomeIcon, AiOutlinePoweroff as LogoutIcon } from 'react-icons/ai'
import { IoChatbubbleEllipsesSharp as ChatIcon } from 'react-icons/io5'
import { Navigate, NavLink, useNavigate } from 'react-router-dom'
import { backURL, logout } from '../../requests'
import { CurrentStatus, UserAvatarStatus, UserAvatarStatusProfile } from '../Avatar/UserAvatarStatus'
import { useContext, useEffect, useRef, useState } from 'react'
import SocketContext from '../Socket/socket-context'
import { SharedUserStatus } from '../../../shared/dtos'
import {IoIosArrowForward} from "react-icons/io"

import './UserCardMenu.css'
import { changeStatus } from '../../requests/ws/users.messages'

export function SideBar()
{
	const {user} = useContext(SocketContext).SocketState;
	const [dropdownDisplay, setDropdownDisplay] = useState(false);

	useEffect(() =>
	{
		const handleClick = () => setDropdownDisplay(false);
		window.addEventListener('click', handleClick)
		
		return () => {
			window.removeEventListener("click", handleClick);
		}
	}, [])

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
				className={`cursor-pointer text-center group flex relative py-2 hover:bg-gray-800 transition-all duration-300 ease-linear`} 
				onClick={(e) => {e.preventDefault(); e.stopPropagation(); setDropdownDisplay(true)}} >
						<UserAvatarStatus userName={user.userName} status={user.status} size={'12'} border={'border-gray-900'} className={''}/>				</div>
				<div className="relative">
					{ dropdownDisplay ? <SideBarAvatarMenu close={() => {setDropdownDisplay(false); console.log("close fired")}}/> : <></>}
				</div>
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

function SideBarAvatarMenu(props: {close: any})
{
	const [dropdownDisplay, setDropdownDisplay] = useState(false);
	const {user, socket} = useContext(SocketContext).SocketState;
	const {userName, status} = user;
	const ref: any = useRef(null)
	const offset = 64;
	let scrollHeight: number = -345;
	const {close} = props;

	useEffect(() =>
	{
		scrollHeight = ref.current.scrollHeight * -1;
		console.log({ref});
		console.log(scrollHeight);
	}, []);

	return (
  		<div ref={ref} className="card absolute left-[56px]" style={{top: `${scrollHeight}` + "px"}}
		onClick={(e) => e.stopPropagation()}>
    		<div className="card-header">
      			<div className="banner relative bg-[#262525]">
					<NavLink to={'/profile/edit'} onClick={close}>
						<div className="group absolute right-[10px] top-[10px]">
							<div className='group relative bg-[#171717] w-[30px] h-[30px] rounded-[50%] flex items-center'>	
								<BsPencilFill size='15' className='mx-auto my-auto'/>
								<span className='z-[250] icon-tooltip left-[3rem] group-hover:scale-100'>Edit Profile</span>
							</div>
						</div>
					</NavLink>
				</div>
      			<div className="infos">
					<NavLink to={'/profile'} onClick={close}>
        				<div className="profil-logo-image">
							<UserAvatarStatusProfile userName={userName} status={status} border={"border-[#292B2F]"} />
        				</div>
					</NavLink>
      			</div>
    		</div>
    		<div className="card-content">
        		<div className="username pl-[5px]">{userName}</div>
        		<hr />
      			<div className="about-me pl-[5px]">
        			<div className="category-title">About Me</div>
					<p>Probably put game info right there</p>
					<p>Like win/loss ratio, rank, gamestatus</p>
      			</div>
				<hr />
				<div className='relative card-button my-[10px]'
				onMouseEnter={() => {setDropdownDisplay(true)}} onMouseLeave={() => {setDropdownDisplay(false)}}>
					<CurrentStatus className="w-[12px]" status={status}/>
					<p className="">Status</p>
					<IoIosArrowForward size='20'className='ml-auto'/>
					{dropdownDisplay ?
						<div className='absolute left-[240px] mx-[15px] px-[15px] w-full bg-transparent'>
							<div className='bg-black px-[7px] py-[7px] rounded-[4px]'>
								<div className='card-button'
								 onClick={() => {changeStatus(socket, SharedUserStatus.ONLINE); close()}}> 
									<img className="w-[12px]" src="/assets/online.png"/>
									<p className="">Online</p>
								</div>
								<hr />
								<div className='card-button'
								 onClick={() => {changeStatus(socket, SharedUserStatus.AWAY); close()}}> 
									<img className="w-[12px]" src="/assets/away.png"/>
									<p className="">Away</p>
								</div>
								<hr />
								<div className='card-button'
								 onClick={() => {changeStatus(socket, SharedUserStatus.BUSY); close()}}> 
									<img className="w-[12px]" src="/assets/busy.png"/>
									<p className="">Busy</p>
								</div>
								<hr />
								<div className='card-button'
								 onClick={() => {changeStatus(socket, SharedUserStatus.OFFLINE); close()}}> 
									<img className="w-[12px]" src="/assets/offline.png"/>
									<p className="">Invisible</p>
								</div>
							</div>
						</div>
					:<></>
				}
				</div>
				<NavLink to='/login' onClick={() => {logout(); close()}} >
					<div className="card-button gap-[6px]">
						<LogoutIcon size='16' className='text-green-600 relative right-[2px]' />
						<p>Logout</p>
					</div>
				</NavLink>
    		</div>
		</div>
	)
}

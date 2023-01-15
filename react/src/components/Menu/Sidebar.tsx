import { BsPersonFill as ProfileIcon } from 'react-icons/bs'
import { GiPingPongBat as PongIcon, GiStarsStack as LeaderBoardIcon } from 'react-icons/gi'
import { AiOutlineHome as HomeIcon, AiOutlinePoweroff as LogoutIcon } from 'react-icons/ai'
import { IoChatbubbleEllipsesSharp as ChatIcon } from 'react-icons/io5'
import { NavLink } from 'react-router-dom'
import { UserAvatarStatus } from '../Avatar/UserAvatarStatus'
import { ReactNode, useContext, useEffect, useState } from 'react'
import SocketContext from '../Socket/socket-context'
import { SideBarAvatarMenu } from "./SideBarAvatarMenu"

export function SideBar()
{
	const { user } = useContext(SocketContext).SocketState;
	const [dropdownDisplay, setDropdownDisplay] = useState(false);

	useEffect(() =>
	{
		const handleClick = () => setDropdownDisplay(false);
		window.addEventListener('click', handleClick)

		return () =>
		{
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
					onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDropdownDisplay(true) }} >
					<UserAvatarStatus userName={user.userName} status={user.status} size={'12'} border={'border-gray-900'} className={''} />				</div>
				<div className="relative">
					{dropdownDisplay ? <SideBarAvatarMenu close={() => { setDropdownDisplay(false) }} /> : <></>}
				</div>
			</div>
		</div>
	)
}

function SideBarIcon({ icon, tooltip = 'tooltip' }: { icon: ReactNode, tooltip: string })
{
	return (
		<div className='sidebar-icon group'>
			{icon}
			<span className='icon-tooltip group-hover:scale-100'>{tooltip}</span>
		</div>
	)
}

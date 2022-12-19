import { BsPersonFill as ProfileIcon } from 'react-icons/bs'
import { GiPingPongBat as PongIcon, GiStarsStack as LeaderBoardIcon } from 'react-icons/gi'
import { AiOutlineHome as HomeIcon, AiOutlinePoweroff as LogoutIcon } from 'react-icons/ai'
import { IoChatbubbleEllipsesSharp as ChatIcon } from 'react-icons/io5'
import { NavLink, useNavigate } from 'react-router-dom'
import { logout } from '../../requests'

export function SideBar()
{
	const navigate = useNavigate();
	return (
		<div className="sticky grow-0 shrink-0 basis-14 h-screen m-0 left-0 top-0 z-50
						flex flex-col justify-between
						bg-gray-900 text-white shadow-lg">
			<div className='basis-1/10'>
				<NavLink to={'/'}>
					<SideBarIcon icon={<HomeIcon size='20' />} tooltip='Home' />
				</NavLink>
			</div>
			<hr className='self-center w-12 border-gray-700' />
			<div className='basis-full overflow-hidden scrollbar-hide'>
				<a onClick={() => navigate("/game")}>
					<SideBarIcon icon={<PongIcon size='20' />} tooltip='Play !' />
				</a>

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
			<hr className='self-center w-12 border-gray-700' />
			<div className='basis-1/10'>
				<NavLink to={'/login'}>
					<SideBarIcon icon={<LogoutIcon size='20' />} tooltip='LogOut' />
				</NavLink>
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

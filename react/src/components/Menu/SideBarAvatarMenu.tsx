import { useContext, useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";

import { AiOutlinePoweroff } from "react-icons/ai";
import { BsPencilFill } from "react-icons/bs";
import { IoIosArrowForward } from "react-icons/io";

import { SharedUserStatus } from "../../../shared/dtos";
import { getUserMe, getUserMeSelect, logout } from "../../requests";
import { changeStatus } from "../../requests/ws/users.messages";
import { CurrentStatus, UserAvatarStatusProfile } from "../Avatar/UserAvatarStatus";
import SocketContext from "../Socket/socket-context";

import './UserCardMenu.css'
import {onlineIcon, offlineIcon, busyIcon, awayIcon} from '../../../assets'


export function SideBarAvatarMenu(props: { close: any })
{
	const [dropdownDisplay, setDropdownDisplay] = useState(false);
	const { user, socket } = useContext(SocketContext).SocketState;
	const [playStats, setPlayStats] = useState<any>(undefined);
	const { userName, status } = user;
	const ref: any = useRef(null)
	const [scrollHeight, setScrollHeight] = useState(0);
	const { close } = props;


	useEffect(() =>
	{
		setScrollHeight(ref.current.scrollHeight * -1);
		async function loadPlayStats()
		{
			const res = await getUserMeSelect(new URLSearchParams({ 'playStats': 'true' }));
			const json = await res.json();
			setPlayStats(json.playStats);
		}
		loadPlayStats();
	}, []);

	useEffect(() =>
	{
		setScrollHeight(ref.current.scrollHeight * -1);
	}, [ref])

	return (
		<div ref={ref} className="card absolute left-[56px]" style={{ top: `${scrollHeight}` + "px" }}
			onClick={(e) => e.stopPropagation()}>
			<div className="card-header">
				<div className="banner relative bg-[#262525]">
					<NavLink to={'/profile/edit'} onClick={close}>
						<div className="group absolute right-[10px] top-[10px]">
							<div className='group relative bg-[#171717] w-[30px] h-[30px] rounded-[50%] flex items-center'>
								<BsPencilFill size='15' className='mx-auto my-auto' />
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
				<div className="username pl-[5px] break-all">{userName}</div>
				<hr />
				<div className="about-me pl-[5px]">
					<div className="category-title">About Me</div>
					{user.gameStatus !== 'NONE' ? <p>Currently {user.gameStatus === 'WAITING' ? 'In Queue' : 'In Game'}</p> : <></>}
					<p>Rank: #{playStats?.rank}, {playStats?.points} points</p>
					<p>Wins: {playStats?.wins} | Losses: {playStats?.losses}</p>
				</div>
				<hr />
				<div className='relative card-button my-[10px]'
					onMouseEnter={() => { setDropdownDisplay(true) }} onMouseLeave={() => { setDropdownDisplay(false) }}>
					<CurrentStatus className="w-[12px]" status={status} />
					<p className="">Status</p>
					<IoIosArrowForward size='20' className='ml-auto' />
					{dropdownDisplay ?
						<div className='absolute left-[240px] mx-[15px] px-[15px] w-full bg-transparent'>
							<div className='bg-black px-[7px] py-[7px] rounded-[4px]'>
								<div className='card-button'
									onClick={() => { changeStatus(socket, SharedUserStatus.ONLINE); close() }}>
									<img className="w-[12px]" src={onlineIcon} />
									<p className="">Online</p>
								</div>
								<hr />
								<div className='card-button'
									onClick={() => { changeStatus(socket, SharedUserStatus.AWAY); close() }}>
									<img className="w-[12px]" src={awayIcon}/>
									<p className="">Away</p>
								</div>
								<hr />
								<div className='card-button'
									onClick={() => { changeStatus(socket, SharedUserStatus.BUSY); close() }}>
									<img className="w-[12px]" src={busyIcon} />
									<p className="">Busy</p>
								</div>
								<hr />
								<div className='card-button'
									onClick={() => { changeStatus(socket, SharedUserStatus.OFFLINE); close() }}>
									<img className="w-[12px]" src={offlineIcon} />
									<p className="">Invisible</p>
								</div>
							</div>
						</div>
						: <></>
					}
				</div>
				<NavLink to='/login' onClick={() => { logout(); close() }} >
					<div className="card-button gap-[6px]">
						<AiOutlinePoweroff size='16' className='text-green-600 relative right-[2px]' />
						<p>Logout</p>
					</div>
				</NavLink>
			</div>
		</div>
	)
}


import { useContext, useEffect, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";

import { backURL } from "../requests/constants";
import { getUserMatchHistory, getUserMeModal, getUserModal } from "../requests";
import { getCookie } from "../requests";
import { addFriend, removeFriend } from "../requests/http/friends.requests";
import SocketContext from "../components/Socket/socket-context";
import { MatchHistoryCard } from "../components/MatchHistoryCard/MatchHistoryCard";
import { StatTable } from "../components/PlayStats/StatTable";
import { SharedOtherUserDto } from "../../shared/dtos";
import * as events from '../../../shared/constants'
import { FaBolt, FaCommentAlt, FaUserFriends, FaUserSlash } from "react-icons/fa";


export async function loader({ params }: any) {
	const res = await getUserModal(params.userName, new URLSearchParams({ 'playStats': 'true', 'matchHistory': 'true' }));
	const profile = await res.json();
	const lol = await getUserMatchHistory(profile.id);
	const matchHistory = await lol.json()
	return ({ profile, matchHistory });
}

export function ProfileView() {
	const data: any = useLoaderData();
	const { profile, matchHistory } = data;
	const playerStats = profile.playStats;
	const masterSocket = useContext(SocketContext).SocketState.socket;
	const user = useContext(SocketContext).SocketState.user;
	const isFriends = user?.friends?.find((e: any) => e.id === profile.id) ? true : false;
	const isBlackListed = user?.blacklist?.find((user: SharedOtherUserDto) => {return user.id === profile.id}) ? true : false;

	const navigate = useNavigate();

	async function handleFriend() {
		if (isFriends) 
		{
			const res = await removeFriend(profile.id);
		}
		else 
		{
			if (isBlackListed)
			{
				masterSocket?.emit(events.UNBLOCK_USER, { userId: profile.id });
			}
			const res = await addFriend(profile.id);
		}
		masterSocket?.emit('changeFriends')
	}

	async function handleBlackList()
	{
		if (isBlackListed)
		{
			masterSocket?.emit(events.UNBLOCK_USER, { userId: profile.id });
		}
		else
		{
			if (isFriends)
			{
				await removeFriend(profile.id)
				masterSocket?.emit("changeFriends");
			}
			masterSocket?.emit(events.BLOCK_USER, { userId: profile.id });
		}
	}

	function handleInvite()
	{
		navigate('/game?' + new URLSearchParams({ 'action': 'invitePlayer', 'userName': profile.userName }));
	}

	function handleSpectate()
	{
		navigate('/game?' + new URLSearchParams({ 'action': 'spectateGame', 'userName': profile.userName }));
	}
	
	function handlePrivmsg()
	{
		navigate('/chat?' + new URLSearchParams({ 'action': 'privmsg', 'userName': profile.userName}));
	}

	return (
		<div className="profilePage
	flex flex-col items-center gap-6
	text-gray-200 bg-gray-700
	h-full">
			<div className="profileTitle
		flex flex-col items-center justify-around
		md:flex-row
		w-full mt-10 p-2
		bg-gray-800 shadow-md">
				<div className="profileImg">
					<img className='rounded-full h-24 w-24' src={`${backURL}/users/avatars/${profile.userName}?time=${Date.now()}`} />
				</div>
				<div className="profileInfo">
					<h3 className="font-bold text-5xl">{profile.userName}</h3>
					{/* <p className="text-center">{profile.email}</p> */}
					<p className="text-center">{profile.status}</p>
					{
						profile.gameStatus !== 'NONE' ?
							<p className="text-center">{profile.gameStatus}</p>
							: null
					}
				</div>
			</div>
			{
				user.id !== profile.id ?
					<>
					<div className="flex gap-4">
						<button className='viewProfileButton' onClick={handleFriend}>
							<div className="w-[50px]">
								<FaUserFriends size="30" className="m-auto" />
							</div>
							<span className="flex-1">
								{isFriends ? "Remove" : "Add"} Friend
							</span>
						</button>
						<button className='viewProfileButton bg-red-600 hover:bg-red-700' onClick={handleBlackList}>
							<div className="w-[50px]">
								<FaUserSlash size="30" className="m-auto" />
							</div>
							<span className="flex-1 text-left ml-[20px]">
								{isBlackListed ? "Unblock" : "Block"}
							</span>
						</button>
						{profile.gameStatus === 'NONE' ? <button className='viewProfileButton' onClick={handleInvite}>
							<div className="w-[50px]">
								<FaBolt size="28" className="m-auto" />
							</div>
							<span className="flex-1 text-left ml-[10px]">
								Challenge
							</span>
							</button> : null}
						{profile.gameStatus === 'INGAME' ? <button className='viewProfileButton' onClick={handleSpectate}>Spectate</button> : null}
						<button className='viewProfileButton' onClick={handlePrivmsg}>
							<div>
								<FaCommentAlt size="25" className='m-auto' />
							</div>	
							<span className="flex-1 ml-[0px]">
								Send Message
							</span>
							</button>
					</div>
					</>
					:
					<></>
			}
			<div className="profilePong
		flex flex-col justify-evenly items-center gap-4
		md:flex-row md:items-start md:justify-evenly md:gap-0
		bg-gray-600 w-11/12 md:max-h-96 py-1
		rounded-lg shadow">
				<div className="profileStatsContainer w-full p-1">
					<StatTable playerStats={playerStats} />
				</div>
				<div className="profileHistoryContainer w-full h-full">
					<h2 className="text-center font-bold text-3xl" >
						Match History
					</h2>
					<div className=" w-full md:h-[90%] overflow-y-auto">
						{
							matchHistory.length !== 0 ?
								(
									<ul className="flex flex-col justify-center items-center">
										{matchHistory.map((v: any) => {
											if (!v || !v.player1 || !v.player2)
												return;
											return (
												<li className="w-full" key={v.gameId}>
													<MatchHistoryCard player1={v.player1} player2={v.player2} />
												</li>)
										})}
									</ul>
								)
								:
								<h3 className="text-center">No match played yet !</h3>
						}
					</div>
				</div>
				<div className="flex-break"></div>
			</div>
		</div>
	)
}

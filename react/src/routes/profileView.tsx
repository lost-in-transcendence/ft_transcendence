// import './styles/profile.css'

import { useContext, useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";

import { backURL } from "../requests/constants";
import { getUserMatchHistory, getUserMeModal, getUserModal } from "../requests";
import { getCookie } from "../requests";
import { addFriend, removeFriend } from "../requests/http/friends.requests";
import SocketContext from "../components/Socket/socket-context";
import { MatchHistoryCard } from "../components/MatchHistoryCard/MatchHistoryCard";

export async function loader({ params }: any)
{
	// let res = await getUserMeModal(new URLSearchParams({'friends': 'true'}));
	// const user = await res.json()
	const res = await getUserModal(params.userName, new URLSearchParams({ 'playStats': 'true', 'matchHistory': 'true' }));
	const profile = await res.json();
	const lol = await getUserMatchHistory(profile.id);
	const matchHistory = await lol.json()
	return ({ profile, matchHistory });
}

export function ProfileView()
{
	const data: any = useLoaderData();
	const { profile, matchHistory } = data;
	// const matchHistory = profile.matchHistory;
	const playerStats = profile.playStats;
	const masterSocket = useContext(SocketContext).SocketState.socket;
	const user = useContext(SocketContext).SocketState.user;
	// const [isFriends, setIsFriends] = useState(user?.friends?.find((e: any) => e.id === profile.id) ? true : false)
	// console.log(user.friends);
	const isFriends = user?.friends?.find((e: any) => e.id === profile.id) ? true : false;

	async function handleFriend()
	{
		if (isFriends)
		{
			const res = await removeFriend(profile.id);
		}
		else
		{
			const res = await addFriend(profile.id);
		}
		masterSocket?.emit('changeFriends')
		// setIsFriends(user?.friends?.find((e: any) => e.id === profile.id) ? true : false);
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
					<p className="text-center">{profile.email}</p>
					<p className="text-center">{profile.status}</p>
					{
						profile.gameStatus !== 'NONE' ?
							<p className="text-center">{profile.gameStatus}</p>
							: null
					}
				</div>
			</div>
			<div className="profilePong
		flex flex-col justify-evenly items-center gap-4
		md:flex-row md:items-start md:justify-evenly md:gap-0
		bg-zinc-500 w-11/12 md:max-h-96 p-2
		rounded">
				<div className="profileStatsContainer w-full h-max p-1">
					<table className="w-full">
						<thead><tr><th colSpan={2}>Stats</th></tr></thead>
						<tbody>
							<tr>
								<td>Wins</td>
								<td>{playerStats.wins}</td>
							</tr>
							<tr>
								<td>Losses</td>
								<td>{playerStats.losses}</td>
							</tr>
							<tr>
								<td>Rank</td>
								<td>{playerStats.rank}</td>
							</tr>
							<tr>
								<td>Points Scored</td>
								<td>{playerStats.points}</td>
							</tr>
							<tr>
								<td>Achievement points</td>
								<td>{playerStats.achievement_points}</td>
							</tr>
						</tbody>

					</table>
				</div>
				<div className="profileHistoryContainer w-full h-full p-1">
					<h2 className="text-center font-bold" >
						Match History
					</h2>
					<br />
					<div className=" w-full md:h-[90%] overflow-y-auto">
						{
							matchHistory.length !== 0 ?
								(
									<ul className="flex flex-col justify-center items-center">
										{matchHistory.map((v: any) =>
										{
											console.log({ v })
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
			{
				user.id !== profile.id ?
					<button className={`${isFriends ? "remove" : "add"}-friend`} onClick={handleFriend}>{isFriends ? "Remove" : "Add"} Friend</button>
					:
					<></>
			}
		</div>
	)
}

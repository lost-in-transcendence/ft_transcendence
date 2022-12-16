
// import './styles/profile.css'

import { NavLink, redirect, useLoaderData, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";

import { backURL } from "../requests/constants";
import { getUserMeFull } from "../requests";
import Modal from "../components/Modal/modal";
import { TwoFa } from "../components/TwoFa/twofa";
import { UserCard } from "../components/UserCard/UserCard";
import SocketContext from "../components/Socket/socket-context";

export async function loader()
{
	const res = await getUserMeFull();
	return (res);
}

export function Profile()
{
	const user: any = useLoaderData();
	console.log({ user });
	const playerStats = user.playStats;
	const navigate = useNavigate();
	const { status } = useContext(SocketContext).SocketState.user;
	user.friends.forEach((f: any) =>
	{
		console.log({ f });
	})
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
					<img className='rounded-full h-24 w-24' src={`${backURL}/users/avatars/${user.userName}?time=${Date.now()}`} />
				</div>
				<div className="profileInfo">
					<h3 className="font-bold text-5xl">{user.userName}</h3>
					<p className="text-center">{user.email}</p>
					<p className="text-center">{status}</p>
				</div>
			</div>
			<div className="profilePong
								flex flex-col justify-evenly items-center gap-4
								md:flex-row md:items-start md:justify-evenly md:gap-0
								bg-zinc-500 w-11/12 md:max-h-96
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
					<h2 className="text-center font-bold" >Match History</h2>
					<div className=" w-full md:h-[90%] overflow-y-auto">
						{
							user.matchHistory !== 0 ?
								(
									<ul className="">
										<li>There is a match history</li>
										<li>There is a match history</li>
										<li>There is a match history</li>
										<li>There is a match history</li>
										<li>There is a match history</li>
										<li>There is a match history</li>
										<li>There is a match history</li>
										<li>There is a match history</li>
										<li>There is a match history</li>
										<li>There is a match history</li>
										<li>There is a match history</li>
										<li>There is a match history</li>
										<li>There is a match history</li>
										<li>There is a match history</li>
										<li>There is a match history</li>
										<li>There is a match history</li>
										<li>There is a match history</li>
										<li>There is a match history</li>
										<li>There is a match history</li>
										<li>There is a match history</li>
										<li>There is a match history</li>
										<li>There is a match history</li>
										<li>There is a match history</li>
										<li>There is a match history</li>
										<li>There is a match history</li>
										<li>There is a match history</li>
										<li>There is a match history</li>
										<li>There is a match history</li>
										<li>There is a match history</li>
										<li>There is a match history</li>
										<li>There is a match history</li>
										<li>There is a match history</li>
										<li>There is a match history</li>
										<li>There is a match history</li>
										<li>There is a match history</li>
										<li>END</li>
									</ul>
								)
								:
								<h3 className="text-center">No match played yet !</h3>
						}
					</div>
				</div>
				<div className="flex-break"></div>
			</div>
			<div className="friendListContainer  w-11/12 md:w-1/2 bg-zinc-500 text-center rounded">
				<h2>Friends</h2>
				{
					user.friends.length > 0 ?
						(
							<div className="overflow-y-auto">
								<ul>
									{user.friends.map((f: any) =>
									{
										return <UserCard user={f}></UserCard>
									})}
								</ul>
							</div>
						)
						:
						<h3>You have no friends :(</h3>
				}
			</div>
			<button onClick={() => { navigate("/profile/edit"); }}>Edit Profile</button>
		</div>
	)
}

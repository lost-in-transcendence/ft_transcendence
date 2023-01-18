

import { useLoaderData, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { BsPencilFill } from "react-icons/bs";

import { backURL } from "../requests/constants";
import { getMyMatchHistory, getUserMeFull } from "../requests";
import SocketContext from "../components/Socket/socket-context";
import { MatchHistoryCard } from "../components/MatchHistoryCard/MatchHistoryCard";
import { StatTable } from "../components/PlayStats/StatTable";

export async function loader() {
	const res = await getUserMeFull();
	const matchHistory = await getMyMatchHistory();
	return ({ user: await res.json(), matchHistory: await matchHistory.json() });
}

export function Profile() {
	const data: any = useLoaderData();
	const { user, matchHistory } = data;
	const playerStats = user.playStats;
	const navigate = useNavigate();
	const { status } = useContext(SocketContext).SocketState.user;
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
					<img className='rounded-full w-24' src={`${backURL}/users/avatars/${user.userName}?time=${Date.now()}`} />
				</div>
				<div className="profileInfo">
					<h3 className="font-bold text-5xl break-all">{user.userName}</h3>
					<p className="text-center">{user.email}</p>
					<p className="text-center">{status}</p>
					{
						user.gameStatus !== 'NONE' ?
							<p className="text-center">{user.gameStatus}</p>
							: null
					}
				</div>
			</div>
			<div className="profilePong
								flex flex-col justify-evenly items-center gap-4
								md:flex-row md:items-start md:justify-evenly md:gap-0
								bg-gray-600 w-11/12 md:max-h-96 py-1
								rounded-lg shadow">
				<div className="profileStatsContainer w-full h-max p-1">
					<StatTable playerStats={playerStats} />
				</div>
				<div className="profileHistoryContainer w-full h-full">
					<h2 className="text-center font-bold text-3xl" >
						Match History
					</h2>
					<div className=" w-full md:h-[90%] overflow-y-auto">
						{
							user.matchHistory !== 0 ?
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
			<button
				className="bg-indigo-500 rounded shadow px-2 text-gray-300 flex items-center gap-1"
				onClick={() => { navigate("/profile/edit"); }}
			>
				<span>
					<BsPencilFill size={12} />
				</span>
				<span>Edit Profile</span>
			</button>
		</div>
	)
}

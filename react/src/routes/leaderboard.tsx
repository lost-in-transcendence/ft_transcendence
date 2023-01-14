import { useContext, useEffect, useState } from "react";
import { redirect, useLoaderData } from "react-router-dom";
import SocketContext from "../components/Socket/socket-context";
import { PlayStats } from "../dto/game.dto";
import { backURL, getUserMe } from "../requests";
import { getLeaderBoard } from "../requests/http/other-requests";

export async function loader()
{
	const res = await getUserMe();
	return res;
}

export function LeaderBoard()
{
	// const user: any = useLoaderData();
	const {socket} = useContext(SocketContext).SocketState;
	const [rankingTimer, setRankingTimer] = useState<Date>()
	const [ranking, setRanking] = useState<undefined | PlayStats[]>(undefined)

	useEffect(() =>
	{
		socket?.on('nextRanking', (payload: {nextRanking: Date}) =>
		{
			const {nextRanking} = payload;
			setRankingTimer(nextRanking);
			async function loadRanking()
			{
				const res = await getLeaderBoard();
				setRanking(await res.json());
			}
			loadRanking()
		})
		socket?.emit('nextRanking');
	}, [])
	
	return (
		<div>
			<h1>
				LEADERBOARD
			</h1>
			<div className="text-center text-white">
				<h2>Hall of Fame</h2>
				<div className="w-[480px] mx-auto flex bg-amber-200">
					<div className="bg-red-600 flex-1">Hello</div>
					<div className="bg-green-600 flex-1">Bye</div>
					<div className="bg-blue-600 flex-1">Hawaii</div>
				</div>
			</div>
			<div>
				{
					ranking ?
					<ul>
						{ranking.map((v: PlayStats) =>
						{
							return (
							<li key={v.userId} className="text-white border-4 border-green-400 flex gap-4 items-center">
								<div>#{v.rank}</div>
								<img className="w-[50px] rounded-full" src={`${backURL}/users/avatars/${v.user.userName}`} />
								<div>{v.user.userName}</div>
							</li>
							)
						})}
					</ul>
					:
					null
				}
			</div>

		</div>
	)
}

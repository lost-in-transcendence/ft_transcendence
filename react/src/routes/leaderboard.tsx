import { useContext, useEffect, useState } from "react";
import { GiStarsStack as LeaderBoardIcon } from 'react-icons/gi'

import SocketContext from "../components/Socket/socket-context";
import { Spinner } from "../components/Spinner/Spinner";
import { PlayStats } from "../dto/game.dto";
import { validateToken } from "../requests";
import { CountDownTimer } from "../components/commons/CountDownTimer";
import { HallOfFame } from "../components/Leaderboard/HallOfFame";
import { Ranking } from "../components/Leaderboard/Ranking";

export async function loader()
{
	const res = await validateToken();
	if (res.status !== 200)
		throw res;
}

export function LeaderBoard()
{
	const { socket } = useContext(SocketContext).SocketState;
	const [nextRanking, setNextRanking] = useState<Date>(new Date(Date.now()))
	const [ranking, setRanking] = useState<undefined | PlayStats[]>(undefined)
	const [loading, setLoading] = useState(true);

	useEffect(() =>
	{
		socket?.on('nextRanking', (payload: { nextRanking: Date, previousRanking: PlayStats[] }) =>
		{
			setLoading(true);
			setNextRanking(new Date(payload.nextRanking));
			setRanking(payload.previousRanking);
			setLoading(false);
		})

		socket?.emit('nextRanking');

		return (() =>
		{
			socket?.off('nextRanking');
		})
	}, [])

	if (loading)
		return (
			<div className="flex flex-col justify-center items-center h-full w-full">
				<h1 className="text-indigo-300 mb-2 text-3xl">Loading Rankings</h1>
				<Spinner />
			</div>
		)

	return (
		<div>
			<h1 className="text-7xl text-center my-5 text-gray-300 flex justify-around" >
				<LeaderBoardIcon className="text-yellow-300" />
				LEADERBOARD
				<LeaderBoardIcon className="text-yellow-300" />
			</h1>
			<div className="mb-[20px]">
				<HallOfFame ranking={ranking} />
			</div>
			<div className="text-center text-white text-xl">
				<h2>Next ranking in...</h2>
				{nextRanking && nextRanking.getTime() > Date.now() ? 
					<CountDownTimer deadline={nextRanking}/>
				:
					<p>Incoming!</p>
				}
			</div>
			<div>
				{
					ranking ?
						<Ranking ranking={ranking} />
						:
						null
				}
			</div>

		</div>
	)
}
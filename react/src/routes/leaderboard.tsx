import { useContext, useEffect, useState } from "react";
import { redirect, useLoaderData, useNavigate } from "react-router-dom";
import { BsFillTrophyFill as Trophy } from "react-icons/bs";
import { GiStarsStack as LeaderBoardIcon } from 'react-icons/gi'

import SocketContext from "../components/Socket/socket-context";
import { Spinner } from "../components/Spinner/Spinner";
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
	const { socket } = useContext(SocketContext).SocketState;
	const [rankingTimer, setRankingTimer] = useState<Date>()
	const [ranking, setRanking] = useState<undefined | PlayStats[]>(undefined)
	const [loading, setLoading] = useState(true);

	useEffect(() =>
	{
		socket?.on('nextRanking', (payload: { nextRanking: Date }) =>
		{
			const { nextRanking } = payload;
			setRankingTimer(nextRanking);
			async function loadRanking()
			{
				const res = await getLeaderBoard();
				setRanking(await res.json());
			}
			setLoading(true);
			loadRanking()
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
			<HallOfFame ranking={ranking} />
			<div>
				{
					ranking ?
						<table className="mt-5 table-auto w-full text-center text-gray-300">
							<thead className="table-header-group">
								<tr className="table-row">
									<th className="table-cell">Rank</th>
									<th className="table-cell text-left">
										<span className="relative left-20">
											Player
										</span>
									</th>
									<th className="table-cell">Points</th>
									<th className="table-cell">Wins</th>
									<th className="table-cell">Losses</th>
								</tr>
							</thead>
							<tbody className="table-row-group">
								{
									ranking.map((v: PlayStats, i: number) =>
									{
										let userName = ''
										if (v.user.userName)
											userName = v.user.userName.length > 15 ? v.user.userName.slice(0, 15) + '...' : v.user.userName;
										let bgColor = i % 2 === 0 ? 'bg-gray-700' : 'bg-gray-800';
										return (
											<tr key={v.userId} className={`text-white ${bgColor} table-row text-xl`}>
												<td className="table-cell">
													<div className="">{v.rank}</div>
												</td>
												<td className="table-cell py-2">
													<div className="flex items-center gap-4">
														<img className="w-12 h-12 rounded-full" src={`${backURL}/users/avatars/${v.user.userName}`} />
														<div className="">{userName}</div>
													</div>
												</td>
												<td className="table-cell">
													<div>{v.points}</div>
												</td>
												<td className="table-cell">
													<div>{v.wins}</div>
												</td>
												<td className="table-cell">
													<div>{v.losses}</div>
												</td>
											</tr>
										)
									})
								}
							</tbody>
						</table>
						:
						null
				}
			</div>

		</div>
	)
}


export function HallOfFame({ ranking }: { ranking: PlayStats[] | undefined })
{
	if (!ranking)
		return null;

	let number1: PlayStats | undefined = undefined;
	let number2: PlayStats | undefined = undefined;
	let number3: PlayStats | undefined = undefined;
	if (ranking.length >= 1)
		number1 = ranking.find((v) => { return v.rank === 1 });
	if (ranking.length >= 2)
		number2 = ranking.find((v) => { return v.rank === 2 });
	if (ranking.length >= 3)
		number3 = ranking.find((v) => { return v.rank === 3 });



	return (
		<div className="text-center text-white">
			<h2>Hall of Fame</h2>
			<div className="w-[480px] mx-auto flex bg-white">
				<Podium number={2} player={number2} />
				<Podium number={1} player={number1} />
				<Podium number={3} player={number3} />
			</div>
		</div>
	)
}

export function Podium({ number, player }: { number: number, player: PlayStats | undefined })
{
	const navigate = useNavigate();
	let imageMargin: number = 0;
	let divBg: string = ''
	let trophyColor: string = '';
	let textColor: string = '';
	let border: string = '';
	if (number === 1)
	{
		imageMargin = 5;
		trophyColor = textColor = 'text-yellow-600'
		border = 'border-l-[3px] border-r-[3px]'
	}
	else if (number === 2)
	{
		imageMargin = 40;
		trophyColor = textColor = 'text-zinc-600'
		border = 'border-l-[3px]'
	}
	else if (number === 3)
	{
		imageMargin = 60;
		trophyColor = textColor = 'text-yellow-900'
		border = 'border-r-[3px]'
	}
	divBg = 'bg-gray-300'
	let imgSrc: string = '';
	if (!player)
		imgSrc = 'https://www.pngkit.com/png/full/72-729913_user-blank-avatar-png.png'
	else
		imgSrc = `${backURL}/users/avatars/${player.user.userName}`
	let userName: string = ''

	if (!player || !player.user.userName)
		userName = "No one :'(";
	else
	{
		userName = player.user.userName.length > 12 ? player.user.userName.slice(0, 12) + "..." : player.user.userName;
	}
	const onClick = player ? () => { navigate(`/profile/view/${player?.user.userName}`) } : () => { };

	return (
		<div className={`flex-1 flex flex-col text-center ${player ? 'cursor-pointer' : ''} bg-gray-800`}
			onClick={onClick}>
			<div className="mb-[5px]" style={{ marginTop: imageMargin + 'px' }}>
				<img className="w-[80px] rounded-full m-auto" src={imgSrc} />
			</div>
			<div className={`${divBg} flex flex-col justify-between items-center w-full h-full border-y-[3px] ${border} border-yellow-600 rounded-sm text-xl ${textColor} `} >
				<p className="text-4xl pt-2">{number}</p>
				<p className="text-2xl pb-[5px]">{userName}</p>
				<Trophy className={` ${trophyColor} mb-2`} size={50} />
			</div>
		</div>
	)
}

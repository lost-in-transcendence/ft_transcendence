import { useContext, useEffect, useState } from "react";
import { redirect, useLoaderData, useNavigate } from "react-router-dom";
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
			<HallOfFame ranking={ranking} />
			<div>
				{
					ranking ?
					<ul>
						{ranking.map((v: PlayStats) =>
						{
							let userName = ''
							if (v.user.userName)
								userName = v.user.userName.length > 15 ? v.user.userName.slice(0, 15) + '...' : v.user.userName;
							return (
							<li key={v.userId} className="text-white border-4 border-green-400 flex gap-4 items-center">
								<div className="w-[30px]">#{v.rank}</div>
								<img className="w-[50px] rounded-full" src={`${backURL}/users/avatars/${v.user.userName}`} />
								<div className="w-[150px]">{userName}</div>
								<div>{v.points}</div>
								<div>{v.wins}</div>
								<div>{v.losses}</div>
							</li>
							)
						})}
						<li key={'asdsdsa'} className="text-white border-4 border-green-400 flex gap-4 items-center">
								<div>#0</div>
								<img className="w-[50px] rounded-full" src={`https://www.pngkit.com/png/full/72-729913_user-blank-avatar-png.png`} />
								<div>La Tua Madre</div>
							</li>
							<li key={'asdsdsa'} className="text-white border-4 border-green-400 flex gap-4 items-center">
								<div>#0</div>
								<img className="w-[50px] rounded-full" src={`https://www.pngkit.com/png/full/72-729913_user-blank-avatar-png.png`} />
								<div>La Tua Madre</div>
							</li>
							<li key={'asdsdsa'} className="text-white border-4 border-green-400 flex gap-4 items-center">
								<div>#0</div>
								<img className="w-[50px] rounded-full" src={`https://www.pngkit.com/png/full/72-729913_user-blank-avatar-png.png`} />
								<div>La Tua Madre</div>
							</li>
							<li key={'asdsdsa'} className="text-white border-4 border-green-400 flex gap-4 items-center">
								<div>#0</div>
								<img className="w-[50px] rounded-full" src={`https://www.pngkit.com/png/full/72-729913_user-blank-avatar-png.png`} />
								<div>La Tua Madre</div>
							</li>
							<li key={'asdsdsa'} className="text-white border-4 border-green-400 flex gap-4 items-center">
								<div>#0</div>
								<img className="w-[50px] rounded-full" src={`https://www.pngkit.com/png/full/72-729913_user-blank-avatar-png.png`} />
								<div>La Tua Madre</div>
							</li>
							<li key={'asdsdsa'} className="text-white border-4 border-green-400 flex gap-4 items-center">
								<div>#0</div>
								<img className="w-[50px] rounded-full" src={`https://www.pngkit.com/png/full/72-729913_user-blank-avatar-png.png`} />
								<div>La Tua Madre</div>
							</li>
							<li key={'asdsdsa'} className="text-white border-4 border-green-400 flex gap-4 items-center">
								<div>#0</div>
								<img className="w-[50px] rounded-full" src={`https://www.pngkit.com/png/full/72-729913_user-blank-avatar-png.png`} />
								<div>La Tua Madre</div>
							</li>
							<li key={'asdsdsa'} className="text-white border-4 border-green-400 flex gap-4 items-center">
								<div>#0</div>
								<img className="w-[50px] rounded-full" src={`https://www.pngkit.com/png/full/72-729913_user-blank-avatar-png.png`} />
								<div>La Tua Madre</div>
							</li>
							
							<li key={'asdsdsa'} className="text-white border-4 border-green-400 flex gap-4 items-center">
								<div>#0</div>
								<img className="w-[50px] rounded-full" src={`https://www.pngkit.com/png/full/72-729913_user-blank-avatar-png.png`} />
								<div>La Tua Madre</div>
							</li>
							
							<li key={'asdsdsa'} className="text-white border-4 border-green-400 flex gap-4 items-center">
								<div>#0</div>
								<img className="w-[50px] rounded-full" src={`https://www.pngkit.com/png/full/72-729913_user-blank-avatar-png.png`} />
								<div>La Tua Madre</div>
							</li>
							<li key={'asdsdsa'} className="text-white border-4 border-green-400 flex gap-4 items-center">
								<div>#0</div>
								<img className="w-[50px] rounded-full" src={`https://www.pngkit.com/png/full/72-729913_user-blank-avatar-png.png`} />
								<div>La Tua Madre</div>
							</li>
							<li key={'asdsdsa'} className="text-white border-4 border-green-400 flex gap-4 items-center">
								<div>#0</div>
								<img className="w-[50px] rounded-full" src={`https://www.pngkit.com/png/full/72-729913_user-blank-avatar-png.png`} />
								<div>La Tua Madre</div>
							</li>
							<li key={'asdsdsa'} className="text-white border-4 border-green-400 flex gap-4 items-center">
								<div>#0</div>
								<img className="w-[50px] rounded-full" src={`https://www.pngkit.com/png/full/72-729913_user-blank-avatar-png.png`} />
								<div>La Tua Madre</div>
							</li>
							<li key={'asdsdsa'} className="text-white border-4 border-green-400 flex gap-4 items-center">
								<div>#0</div>
								<img className="w-[50px] rounded-full" src={`https://www.pngkit.com/png/full/72-729913_user-blank-avatar-png.png`} />
								<div>La Tua Madre</div>
							</li>
							<li key={'asdsdsa'} className="text-white border-4 border-green-400 flex gap-4 items-center">
								<div>#0</div>
								<img className="w-[50px] rounded-full" src={`https://www.pngkit.com/png/full/72-729913_user-blank-avatar-png.png`} />
								<div>La Tua Madre</div>
							</li>
							<li key={'asdsdsa'} className="text-white border-4 border-green-400 flex gap-4 items-center">
								<div>#0</div>
								<img className="w-[50px] rounded-full" src={`https://www.pngkit.com/png/full/72-729913_user-blank-avatar-png.png`} />
								<div>La Tua Madre</div>
							</li>
							<li key={'asdsdsa'} className="text-white border-4 border-green-400 flex gap-4 items-center">
								<div>#0</div>
								<img className="w-[50px] rounded-full" src={`https://www.pngkit.com/png/full/72-729913_user-blank-avatar-png.png`} />
								<div>La Tua Madre</div>
							</li>
							<li key={'asdsdsa'} className="text-white border-4 border-green-400 flex gap-4 items-center">
								<div>#0</div>
								<img className="w-[50px] rounded-full" src={`https://www.pngkit.com/png/full/72-729913_user-blank-avatar-png.png`} />
								<div>La Tua Madre</div>
							</li>
							<li key={'asdsdsa'} className="text-white border-4 border-green-400 flex gap-4 items-center">
								<div>#0</div>
								<img className="w-[50px] rounded-full" src={`https://www.pngkit.com/png/full/72-729913_user-blank-avatar-png.png`} />
								<div>La Tua Madre</div>
							</li>
							<li key={'asdsdsa'} className="text-white border-4 border-green-400 flex gap-4 items-center">
								<div>#0</div>
								<img className="w-[50px] rounded-full" src={`https://www.pngkit.com/png/full/72-729913_user-blank-avatar-png.png`} />
								<div>La Tua Madre</div>
							</li>
							<li key={'asdsdsa'} className="text-white border-4 border-green-400 flex gap-4 items-center">
								<div>#0</div>
								<img className="w-[50px] rounded-full" src={`https://www.pngkit.com/png/full/72-729913_user-blank-avatar-png.png`} />
								<div>La Tua Madre</div>
							</li>
							<li key={'asdsdsa'} className="text-white border-4 border-green-400 flex gap-4 items-center">
								<div>#0</div>
								<img className="w-[50px] rounded-full" src={`https://www.pngkit.com/png/full/72-729913_user-blank-avatar-png.png`} />
								<div>La Tua Madre</div>
							</li>
							<li key={'asdsdsa'} className="text-white border-4 border-green-400 flex gap-4 items-center">
								<div>#0</div>
								<img className="w-[50px] rounded-full" src={`https://www.pngkit.com/png/full/72-729913_user-blank-avatar-png.png`} />
								<div>La Tua Madre</div>
							</li>
							<li key={'asdsdsa'} className="text-white border-4 border-green-400 flex gap-4 items-center">
								<div>#0</div>
								<img className="w-[50px] rounded-full" src={`https://www.pngkit.com/png/full/72-729913_user-blank-avatar-png.png`} />
								<div>La Tua Madre</div>
							</li>
							<li key={'asdsdsa'} className="text-white border-4 border-green-400 flex gap-4 items-center">
								<div>#0</div>
								<img className="w-[50px] rounded-full" src={`https://www.pngkit.com/png/full/72-729913_user-blank-avatar-png.png`} />
								<div>La Tua Madre</div>
							</li>
							<li key={'asdsdsa'} className="text-white border-4 border-green-400 flex gap-4 items-center">
								<div>#0</div>
								<img className="w-[50px] rounded-full" src={`https://www.pngkit.com/png/full/72-729913_user-blank-avatar-png.png`} />
								<div>La Tua Madre</div>
							</li>
							<li key={'asdsdsa'} className="text-white border-4 border-green-400 flex gap-4 items-center">
								<div>#0</div>
								<img className="w-[50px] rounded-full" src={`https://www.pngkit.com/png/full/72-729913_user-blank-avatar-png.png`} />
								<div>La Tua Madre</div>
							</li>
							<li key={'asdsdsa'} className="text-white border-4 border-green-400 flex gap-4 items-center">
								<div>#0</div>
								<img className="w-[50px] rounded-full" src={`https://www.pngkit.com/png/full/72-729913_user-blank-avatar-png.png`} />
								<div>La Tua Madre</div>
							</li>
							<li key={'asdsdsa'} className="text-white border-4 border-green-400 flex gap-4 items-center">
								<div>#0</div>
								<img className="w-[50px] rounded-full" src={`https://www.pngkit.com/png/full/72-729913_user-blank-avatar-png.png`} />
								<div>La Tua Madre</div>
							</li>
							<li key={'asdsdsa'} className="text-white border-4 border-green-400 flex gap-4 items-center">
								<div>#0</div>
								<img className="w-[50px] rounded-full" src={`https://www.pngkit.com/png/full/72-729913_user-blank-avatar-png.png`} />
								<div>La Tua Madre</div>
							</li>

					</ul>
					:
					null
				}
			</div>

		</div>
	)
}


export function HallOfFame({ranking} : {ranking: PlayStats[] | undefined})
{
	if (!ranking)
		return null;

	let number1: PlayStats | undefined = undefined;
	let number2: PlayStats | undefined = undefined;
	let number3: PlayStats | undefined = undefined;
	if (ranking.length >= 1)
		number1 = ranking.find((v) => {return v.rank === 1});
	if (ranking.length >= 2)
		number2 = ranking.find((v) => {return v.rank === 2});
	if (ranking.length >= 3)
		number3 = ranking.find((v) => {return v.rank === 3});



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

export function Podium({number, player} : {number: number, player: PlayStats | undefined})
{
	const navigate = useNavigate();
	let imageMargin: number = 0;
	let divBg: string = ''
	if (number === 1)
	{
		imageMargin = 5;
		divBg = 'bg-green-600';
	}
	else if (number === 2)
	{
		imageMargin = 40;
		divBg = 'bg-indigo-500';
	}
	else if (number === 3)
	{
		imageMargin = 60;
		divBg = 'bg-slate-500';
	}
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
	const onClick = player ? () => {navigate(`/profile/view/${player?.user.userName}`)} : () => {};

	return (
		<div className={`flex-1 flex flex-col text-center ${player ? 'cursor-pointer' : ''}`} 
		onClick={onClick}>
					<div className="mb-[5px]" style={{marginTop: imageMargin + 'px'}}>
						<img className="w-[80px] rounded-full m-auto" src={imgSrc}/>
					</div>
					<div className={`${divBg} w-full h-full border-y-[1px] border-l-[1px] border-black text-xl`} >
						<p>#{number}</p>
						<p className="text-xl pb-[5px]">{userName}</p>
					</div>
				</div>
	)
}
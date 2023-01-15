import { useEffect } from 'react';
import { FaTrophy } from 'react-icons/fa'

import { backURL } from "../../requests";

export function MatchHistoryCard(props: { player1: any, player2: any })
{
	const { player1, player2 } = props;

	const result = player1.score > player2.score ? 'WINNER' : player1.score < player2.score ? 'LOSER' : 'DRAW';

	const border = result === 'WINNER' ? 'border-green-900' : result === 'LOSER' ? 'border-red-900' : 'border-neutral-300';

	let p1ScoreColor = player1.score < player2.score ? 'text-red-700' : 'text-green-700';
	let p2ScoreColor = player2.score < player1.score ? 'text-red-700' : 'text-green-700';
	if (player1.score === player2.score)
		p1ScoreColor = p2ScoreColor = 'text-yellow-700'

	return (
		<div className="flex flex-col justify-around items-center rounded shadow p-2 m-2 bg-gray-700">
			<div>
				{player1.userName} vs {player2.userName}
			</div>
			<div
				className="w-full flex flex-row justify-evenly items-center text-7xl"
			>
				<p className="basis-full flex justify-around items-center gap-6">
					<img
						className="rounded-full w-16 h-16"
						src={`${backURL}/users/avatars/${player1.userName}?time=${Date.now()}`}
					/>
					<span className={`${p1ScoreColor}`} >
						{player1.score}
					</span>
				</p>
				<p className="self-start justify-self-auto">-</p>
				<p className="basis-full flex justify-around items-center gap-6">
					<span className={`${p2ScoreColor}`} >
						{player2.score}
					</span>
					<img
						className="rounded-full w-16 h-16"
						src={`${backURL}/users/avatars/${player2.userName}?time=${Date.now()}`}
					/>
				</p>
			</div>
		</div>
	)
}

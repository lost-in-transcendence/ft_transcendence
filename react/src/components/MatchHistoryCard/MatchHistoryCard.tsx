import { Link } from "react-router-dom";
import { backURL } from "../../requests";

export function MatchHistoryCard(props : {player1: any, player2: any})
{
	const {player1, player2} = props;

	const result = player1.score > player2.score ? 'WINNER' : player1.score < player2.score ? 'LOSER' : 'DRAW';

	const border = result === 'WINNER' ? 'border-green-900' : result === 'LOSER' ? 'border-red-900' : 'border-neutral-300';
	return (
		<>
			<div className={'w-[60%] flex flex-row gap-6 items-center text-center border-4 ' + border}>
				<img className="w-12 h-12 rounded-full" src={`${backURL}/users/avatars/${player1.userName}?time=${Date.now()}`} />
				<div>
					<p>{player1.userName} VS {player2.userName}</p>
					<p>{player1.score} - {player2.score}</p>
					<p>{result}</p>
				</div>
				<Link to={`/profile/view/${player2.userName}`}>	
					<img className="w-12 h-12 rounded-full" src={`${backURL}/users/avatars/${player2.userName}?time=${Date.now()}`} />
				</Link>
			</div>
		</>
	)
}
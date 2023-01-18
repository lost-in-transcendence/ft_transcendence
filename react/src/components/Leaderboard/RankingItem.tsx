import { PlayStats } from "../../dto/game.dto";
import { backURL } from "../../requests";

export function RankingItem({v, i}: {v: PlayStats, i: number})
{
    let userName = ''
	if (v.user.userName)
	    userName = v.user.userName.length > 15 ? v.user.userName.slice(0, 15) + '...' : v.user.userName;
    let bgColor = i % 2 === 0 ? 'bg-gray-700' : 'bg-gray-800';
	return (
		<tr className={`text-white ${bgColor} table-row text-xl`}>
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
}
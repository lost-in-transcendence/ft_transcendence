interface IPlayerStats
{
	wins: number
	losses: number
	rank: number
	points: number
	achievement_points: number
}

interface IStatTableProps
{
	playerStats: IPlayerStats
}

export function StatTable({ playerStats }: IStatTableProps)
{
	return (
		<table className="w-full text-3xl">
			<thead><tr><th colSpan={2}>Stats</th></tr></thead>
			<tbody className="flex flex-col justify-around items-center h-80">
				<tr className="flex items-start w-full px-10 justify-between">
					<td>Wins</td>
					<td>{playerStats.wins}</td>
				</tr>
				<tr className="flex items-start w-full px-10 justify-between">
					<td>Losses</td>
					<td>{playerStats.losses}</td>
				</tr>
				<tr className="flex items-start w-full px-10 justify-between">
					<td>Rank</td>
					<td>{playerStats.rank}</td>
				</tr>
				<tr  className="flex items-start w-full px-10 justify-between">
					<td>Points Scored</td>
					<td>{playerStats.points}</td>
				</tr>
				<tr  className="flex items-start w-full px-10 justify-between">
					<td>Achievement points</td>
					<td>{playerStats.achievement_points}</td>
				</tr>
			</tbody>

		</table>
	)
}
